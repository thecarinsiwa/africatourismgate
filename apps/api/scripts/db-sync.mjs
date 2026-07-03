/**
 * Synchronize MySQL schema migrations and insert-only seeds.
 *
 * Run:
 *   pnpm --filter @africatourismgate/api db:sync
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createConnection } from 'mysql2/promise';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '../../..');
const schemaPath = join(root, 'database/africatourismgate_database.sql');
const migrationsDir = join(root, 'database/migrations');
const seedPath = join(root, 'database/seeds/install.seed.sql');
const migrationsTable = 'schema_migrations';

function log(message) {
  console.log(`[db:sync] ${message}`);
}

function loadEnvFile(path) {
  if (!existsSync(path)) return;

  for (const rawLine of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const match = line.match(/^([^#=]+)=(.*)$/);
    if (!match) continue;

    const key = match[1].trim();
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function loadEnv() {
  loadEnvFile(join(root, '.env'));
  loadEnvFile(join(root, '.env.local'));
}

function sanitizeDatabaseName(name) {
  if (!/^[a-zA-Z0-9_]+$/.test(name)) {
    throw new Error(
      `Invalid DATABASE_NAME "${name}". Use only letters, numbers, and underscores.`,
    );
  }
  return name;
}

function getMysqlConfig() {
  return {
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: Number(process.env.DATABASE_PORT ?? '3306'),
    user: process.env.DATABASE_USER ?? 'root',
    password: process.env.DATABASE_PASSWORD ?? '',
    database: sanitizeDatabaseName(process.env.DATABASE_NAME ?? 'africatourismgate'),
  };
}

function prepareSchemaSql(sql) {
  return sql
    .replace(/DROP DATABASE IF EXISTS[^;]+;/gi, '')
    .replace(/CREATE DATABASE[^;]+;/gi, '')
    .replace(/USE\s+`[^`]+`\s*;/gi, '')
    .replace(/CREATE TABLE `/gi, 'CREATE TABLE IF NOT EXISTS `');
}

function splitSqlStatements(sql) {
  const statements = [];
  let current = '';
  let quote = null;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < sql.length; i += 1) {
    const char = sql[i];
    const next = sql[i + 1];

    if (inLineComment) {
      current += char;
      if (char === '\n') inLineComment = false;
      continue;
    }

    if (inBlockComment) {
      current += char;
      if (char === '*' && next === '/') {
        current += next;
        i += 1;
        inBlockComment = false;
      }
      continue;
    }

    if (quote) {
      current += char;
      if (char === '\\') {
        current += next ?? '';
        i += 1;
        continue;
      }
      if (char === quote) {
        if (quote === "'" && next === "'") {
          current += next;
          i += 1;
          continue;
        }
        quote = null;
      }
      continue;
    }

    if (char === '-' && next === '-') {
      current += char;
      current += next;
      i += 1;
      inLineComment = true;
      continue;
    }

    if (char === '/' && next === '*') {
      current += char;
      current += next;
      i += 1;
      inBlockComment = true;
      continue;
    }

    if (char === "'" || char === '"' || char === '`') {
      quote = char;
      current += char;
      continue;
    }

    if (char === ';') {
      const statement = current.trim();
      if (statement) statements.push(statement);
      current = '';
      continue;
    }

    current += char;
  }

  const trailing = current.trim();
  if (trailing) statements.push(trailing);
  return statements;
}

function stripLeadingComments(statement) {
  return statement
    .replace(/^\s*(?:--[^\r\n]*(?:\r?\n|$)|\/\*[\s\S]*?\*\/\s*)+/g, '')
    .trim();
}

function checksum(sql) {
  return createHash('sha256').update(sql).digest('hex');
}

async function ensureDatabaseExists(mysql) {
  const connection = await createConnection({
    host: mysql.host,
    port: mysql.port,
    user: mysql.user,
    password: mysql.password,
  });

  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${mysql.database}\`
       CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
  } finally {
    await connection.end();
  }
}

async function databaseHasApplicationTables(connection, database) {
  const [rows] = await connection.query(
    `SELECT COUNT(*) AS count
     FROM information_schema.tables
     WHERE table_schema = ?
       AND table_type = 'BASE TABLE'
       AND table_name <> ?`,
    [database, migrationsTable],
  );
  return Number(rows[0]?.count ?? 0) > 0;
}

async function importInitialSchema(connection, mysql) {
  if (!existsSync(schemaPath)) {
    throw new Error(`Schema file not found: ${schemaPath}`);
  }

  if (await databaseHasApplicationTables(connection, mysql.database)) {
    log(`Application tables already exist in "${mysql.database}" - skipping schema import`);
    return;
  }

  log(`Importing initial schema into "${mysql.database}"`);
  const sql = prepareSchemaSql(readFileSync(schemaPath, 'utf8'));
  for (const statement of splitSqlStatements(sql)) {
    await connection.query(statement);
  }
}

async function ensureMigrationsTable(connection) {
  await connection.query(
    `CREATE TABLE IF NOT EXISTS \`${migrationsTable}\` (
       \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
       \`name\` VARCHAR(255) NOT NULL,
       \`checksum\` CHAR(64) NOT NULL,
       \`executed_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
       PRIMARY KEY (\`id\`),
       UNIQUE KEY \`uq_schema_migrations_name\` (\`name\`)
     ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  );
}

async function appliedMigration(connection, name) {
  const [rows] = await connection.query(
    `SELECT \`checksum\` FROM \`${migrationsTable}\` WHERE \`name\` = ?`,
    [name],
  );
  return rows[0] ?? null;
}

async function runMigrations(connection) {
  await ensureMigrationsTable(connection);

  if (!existsSync(migrationsDir)) {
    log('No migrations directory found - skipping migrations');
    return;
  }

  const migrationFiles = readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b));

  if (migrationFiles.length === 0) {
    log('No migration files found');
    return;
  }

  for (const name of migrationFiles) {
    const path = join(migrationsDir, name);
    const sql = readFileSync(path, 'utf8');
    const hash = checksum(sql);
    const applied = await appliedMigration(connection, name);

    if (applied) {
      if (applied.checksum !== hash) {
        log(
          `Migration "${name}" already applied with an older checksum - updating checksum without re-running`,
        );
        await connection.query(
          `UPDATE \`${migrationsTable}\` SET \`checksum\` = ? WHERE \`name\` = ?`,
          [hash, name],
        );
      } else {
        log(`Migration already applied: ${name}`);
      }
      continue;
    }

    log(`Applying migration: ${name}`);
    for (const statement of splitSqlStatements(sql)) {
      await connection.query(statement);
    }

    await connection.query(
      `INSERT INTO \`${migrationsTable}\` (\`name\`, \`checksum\`) VALUES (?, ?)`,
      [name, hash],
    );
  }
}

function seedStatementForInsertOnly(statement) {
  const clean = stripLeadingComments(statement);
  if (!clean) return null;

  if (/^INSERT\s+INTO\b/i.test(clean)) {
    return statement.replace(/\bINSERT\s+INTO\b/i, 'INSERT IGNORE INTO');
  }

  if (/^SET\s+FOREIGN_KEY_CHECKS\b/i.test(clean)) {
    return null;
  }

  if (/^SET\s+/i.test(clean)) {
    return statement;
  }

  return null;
}

async function syncSeedsInsertOnly(connection) {
  if (!existsSync(seedPath)) {
    log('No seed file found - skipping seeds');
    return;
  }

  let executed = 0;
  let insertedOrIgnoredRows = 0;
  let skipped = 0;

  log('Synchronizing seeds in insert-only mode');
  for (const statement of splitSqlStatements(readFileSync(seedPath, 'utf8'))) {
    const insertOnlyStatement = seedStatementForInsertOnly(statement);
    if (!insertOnlyStatement) {
      skipped += 1;
      continue;
    }

    const [result] = await connection.query(insertOnlyStatement);
    executed += 1;
    insertedOrIgnoredRows += Number(result?.affectedRows ?? 0);
  }

  log(
    `Seed sync complete (${executed} statements, ${insertedOrIgnoredRows} affected rows, ${skipped} skipped non-insert statements)`,
  );
}

async function main() {
  loadEnv();
  const mysql = getMysqlConfig();

  log(`Using database "${mysql.database}" on ${mysql.host}:${mysql.port}`);
  await ensureDatabaseExists(mysql);

  const connection = await createConnection({
    host: mysql.host,
    port: mysql.port,
    user: mysql.user,
    password: mysql.password,
    database: mysql.database,
  });

  try {
    await importInitialSchema(connection, mysql);
    await runMigrations(connection);
    await syncSeedsInsertOnly(connection);
    log('Database synchronization complete');
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error(`[db:sync] ${error instanceof Error ? error.stack : String(error)}`);
  process.exitCode = 1;
});
