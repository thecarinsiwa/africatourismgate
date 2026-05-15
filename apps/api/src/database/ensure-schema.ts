import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createConnection } from 'mysql2/promise';
import { ensureDatabaseExists } from './ensure-database';
import { getMysqlConfig, isAutoSchemaEnabled, MysqlConfig } from './mysql-config';

const logger = new Logger('DatabaseBootstrap');

const SCHEMA_FILE = 'africatourismgate_database.sql';

function resolveSchemaSqlPath(): string {
  const candidates = [
    join(__dirname, '../../../../database', SCHEMA_FILE),
    join(process.cwd(), 'database', SCHEMA_FILE),
    join(process.cwd(), '../../database', SCHEMA_FILE),
  ];
  for (const path of candidates) {
    if (existsSync(path)) return path;
  }
  throw new Error(
    `Schema file "${SCHEMA_FILE}" not found. Expected at database/${SCHEMA_FILE} in the repo root.`,
  );
}

/** Strips destructive statements and makes CREATE TABLE idempotent. */
export function prepareSchemaSql(sql: string): string {
  return sql
    .replace(/DROP DATABASE IF EXISTS[^;]+;/gi, '')
    .replace(/CREATE DATABASE[^;]+;/gi, '')
    .replace(/USE\s+`[^`]+`\s*;/gi, '')
    .replace(/CREATE TABLE `/gi, 'CREATE TABLE IF NOT EXISTS `');
}

async function databaseHasTables(mysql: MysqlConfig): Promise<boolean> {
  const connection = await createConnection({
    host: mysql.host,
    port: mysql.port,
    user: mysql.user,
    password: mysql.password,
    database: mysql.database,
  });

  try {
    const [rows] = await connection.query(
      `SELECT COUNT(*) AS count
       FROM information_schema.tables
       WHERE table_schema = ? AND table_type = 'BASE TABLE'`,
      [mysql.database],
    );
    const result = rows as { count: number }[];
    const count = Number(result[0]?.count ?? 0);
    return count > 0;
  } finally {
    await connection.end();
  }
}

/**
 * Creates the database, then imports `database/africatourismgate_database.sql`
 * when no tables exist (application startup, not `nest build`).
 */
export async function ensureSchema(config: ConfigService): Promise<void> {
  if (!isAutoSchemaEnabled(config)) {
    logger.log('DATABASE_AUTO_SCHEMA=false — skipping schema import');
    return;
  }

  await ensureDatabaseExists(config);
  const mysql = getMysqlConfig(config);

  if (await databaseHasTables(mysql)) {
    logger.log(`Tables already exist in "${mysql.database}" — skipping schema import`);
    return;
  }

  const schemaPath = resolveSchemaSqlPath();
  const sql = prepareSchemaSql(readFileSync(schemaPath, 'utf8'));

  logger.log(`Importing schema from ${schemaPath} into "${mysql.database}"…`);

  const connection = await createConnection({
    host: mysql.host,
    port: mysql.port,
    user: mysql.user,
    password: mysql.password,
    database: mysql.database,
    multipleStatements: true,
  });

  try {
    await connection.query(sql);
    logger.log(`Schema imported into "${mysql.database}"`);
  } finally {
    await connection.end();
  }
}
