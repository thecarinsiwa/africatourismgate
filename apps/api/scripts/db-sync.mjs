/**
 * Synchronize MySQL schema migrations and insert-only seeds.
 *
 * Run:
 *   pnpm --filter @africatourismgate/api db:sync
 *   SEED_PROFILE=prod pnpm db:sync   # skip CMS/demo DML from migrations + seed
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createConnection } from 'mysql2/promise';
import {
  INSTALL_SEED_TABLES,
  PROD_MIGRATION_DATA_TABLES,
  extractDmlTable,
  isDataMutationStatement,
  isProdSeedProfile,
} from './install-allowed-tables.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '../../..');
const schemaPath = join(root, 'database/africatourismgate_database.sql');
const migrationsDir = join(root, 'database/migrations');
const migrationsTable = 'schema_migrations';
const INSTALL_SEED_TABLE_SET = new Set(INSTALL_SEED_TABLES);

function resolveSeedPath() {
  if (process.env.DATABASE_SEED_FILE) {
    const custom = process.env.DATABASE_SEED_FILE;
    const absolute = custom.includes('/') || custom.includes('\\')
      ? custom
      : join(root, 'database/seeds', custom);
    return absolute;
  }

  const profile = (process.env.SEED_PROFILE ?? 'dev').toLowerCase();
  const file =
    profile === 'prod' || profile === 'production'
      ? 'install.seed.prod.sql'
      : 'install.seed.sql';
  return join(root, 'database/seeds', file);
}

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

async function runMigrations(connection, { prodSafe }) {
  await ensureMigrationsTable(connection);

  if (!existsSync(migrationsDir)) {
    log('No migrations directory found - skipping migrations');
    return;
  }

  const migrationFiles = readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    // Binary order: `foo.sql` before `foo_bar.sql` (localeCompare can invert that).
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

  if (migrationFiles.length === 0) {
    log('No migration files found');
    return;
  }

  if (prodSafe) {
    log(
      'Prod seed profile: migration data DML limited to ' +
        [...PROD_MIGRATION_DATA_TABLES].join(', '),
    );
  }

  let skippedDataStatements = 0;

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
      const clean = stripLeadingComments(statement);
      if (!clean) continue;

      if (prodSafe && isDataMutationStatement(clean)) {
        const table = extractDmlTable(clean);
        if (!table || !PROD_MIGRATION_DATA_TABLES.has(table)) {
          skippedDataStatements += 1;
          log(
            `  skip data DML on unauthorized table` +
              (table ? ` \`${table}\`` : '') +
              `: ${clean.slice(0, 72)}${clean.length > 72 ? '…' : ''}`,
          );
          continue;
        }
      }

      await connection.query(statement);
    }

    await connection.query(
      `INSERT INTO \`${migrationsTable}\` (\`name\`, \`checksum\`) VALUES (?, ?)`,
      [name, hash],
    );
  }

  if (prodSafe && skippedDataStatements > 0) {
    log(
      `Skipped ${skippedDataStatements} migration data statement(s) outside install-allowed tables`,
    );
  }
}

function seedStatementForInsertOnly(statement, { prodSafe }) {
  const clean = stripLeadingComments(statement);
  if (!clean) return null;

  if (/^INSERT\s+INTO\b/i.test(clean)) {
    if (prodSafe) {
      const table = extractDmlTable(clean);
      if (!table || !INSTALL_SEED_TABLE_SET.has(table)) {
        return { skip: true, reason: table ? `table \`${table}\`` : 'unknown table' };
      }
    }
    return {
      skip: false,
      sql: statement.replace(/\bINSERT\s+INTO\b/i, 'INSERT IGNORE INTO'),
    };
  }

  if (/^SET\s+FOREIGN_KEY_CHECKS\b/i.test(clean)) {
    return null;
  }

  if (/^SET\s+/i.test(clean)) {
    return { skip: false, sql: statement };
  }

  return null;
}

async function syncSeedsInsertOnly(connection, seedPath, { prodSafe }) {
  if (!existsSync(seedPath)) {
    log('No seed file found - skipping seeds');
    return;
  }

  let executed = 0;
  let insertedOrIgnoredRows = 0;
  let skipped = 0;
  let skippedUnauthorized = 0;

  log(`Synchronizing seeds in insert-only mode (${seedPath})`);
  if (prodSafe) {
    log(
      'Prod seed profile: seed INSERT limited to ' +
        INSTALL_SEED_TABLES.join(', '),
    );
  }

  for (const statement of splitSqlStatements(readFileSync(seedPath, 'utf8'))) {
    const insertOnlyStatement = seedStatementForInsertOnly(statement, { prodSafe });
    if (!insertOnlyStatement) {
      skipped += 1;
      continue;
    }
    if (insertOnlyStatement.skip) {
      skippedUnauthorized += 1;
      log(`  skip seed INSERT (${insertOnlyStatement.reason})`);
      continue;
    }

    const [result] = await connection.query(insertOnlyStatement.sql);
    executed += 1;
    insertedOrIgnoredRows += Number(result?.affectedRows ?? 0);
  }

  log(
    `Seed sync complete (${executed} statements, ${insertedOrIgnoredRows} affected rows, ${skipped} skipped non-insert statements` +
      (skippedUnauthorized
        ? `, ${skippedUnauthorized} skipped unauthorized tables`
        : '') +
      `)`,
  );
}

async function main() {
  loadEnv();
  const mysql = getMysqlConfig();
  const seedPath = resolveSeedPath();
  const prodSafe = isProdSeedProfile();

  log(`Using database "${mysql.database}" on ${mysql.host}:${mysql.port}`);
  if (prodSafe) {
    log('SEED_PROFILE=prod — unauthorized table data will not be imported');
  }
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
    await runMigrations(connection, { prodSafe });
    await syncSeedsInsertOnly(connection, seedPath, { prodSafe });
    log('Database synchronization complete');
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error(`[db:sync] ${error instanceof Error ? error.stack : String(error)}`);
  process.exitCode = 1;
});
