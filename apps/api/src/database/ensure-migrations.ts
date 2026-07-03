import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createConnection } from 'mysql2/promise';
import { getMysqlConfig, isAutoSchemaEnabled } from './mysql-config';

const logger = new Logger('DatabaseBootstrap');
const MIGRATIONS_TABLE = 'schema_migrations';

function resolveMigrationsDir(): string {
  const candidates = [
    join(__dirname, '../../../../database/migrations'),
    join(process.cwd(), 'database/migrations'),
    join(process.cwd(), '../../database/migrations'),
  ];
  for (const path of candidates) {
    if (existsSync(path)) return path;
  }
  throw new Error('Migrations directory not found (expected database/migrations).');
}

function checksum(sql: string): string {
  return createHash('sha256').update(sql).digest('hex');
}

function splitSqlStatements(sql: string): string[] {
  const statements: string[] = [];
  let current = '';
  let quote: string | null = null;
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

async function ensureMigrationsTable(connection: Awaited<ReturnType<typeof createConnection>>) {
  await connection.query(
    `CREATE TABLE IF NOT EXISTS \`${MIGRATIONS_TABLE}\` (
       \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
       \`name\` VARCHAR(255) NOT NULL,
       \`checksum\` CHAR(64) NOT NULL,
       \`executed_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
       PRIMARY KEY (\`id\`),
       UNIQUE KEY \`uq_schema_migrations_name\` (\`name\`)
     ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  );
}

/** Apply pending SQL files from database/migrations (same logic as pnpm db:sync). */
export async function ensureMigrations(config: ConfigService): Promise<void> {
  if (!isAutoSchemaEnabled(config)) {
    logger.log('DATABASE_AUTO_SCHEMA=false — skipping migrations');
    return;
  }

  const mysql = getMysqlConfig(config);
  const migrationsDir = resolveMigrationsDir();
  const migrationFiles = readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b));

  if (migrationFiles.length === 0) {
    return;
  }

  const connection = await createConnection({
    host: mysql.host,
    port: mysql.port,
    user: mysql.user,
    password: mysql.password,
    database: mysql.database,
  });

  try {
    await ensureMigrationsTable(connection);

    for (const name of migrationFiles) {
      const path = join(migrationsDir, name);
      const sql = readFileSync(path, 'utf8');
      const hash = checksum(sql);

      const [rows] = await connection.query(
        `SELECT \`checksum\` FROM \`${MIGRATIONS_TABLE}\` WHERE \`name\` = ?`,
        [name],
      );
      const applied = (rows as { checksum: string }[])[0];

      if (applied) {
        if (applied.checksum !== hash) {
          throw new Error(
            `Migration "${name}" was already applied with a different checksum`,
          );
        }
        continue;
      }

      logger.log(`Applying migration: ${name}`);
      for (const statement of splitSqlStatements(sql)) {
        await connection.query(statement);
      }
      await connection.query(
        `INSERT INTO \`${MIGRATIONS_TABLE}\` (\`name\`, \`checksum\`) VALUES (?, ?)`,
        [name, hash],
      );
    }
  } finally {
    await connection.end();
  }
}
