import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createConnection } from 'mysql2/promise';
import { getMysqlConfig } from './mysql-config';

const logger = new Logger('DatabaseBootstrap');

const MIGRATION_FILE = 'add_email_operation_verifications.sql';

function resolveMigrationPath(): string {
  const candidates = [
    join(__dirname, '../../../../database/migrations', MIGRATION_FILE),
    join(process.cwd(), 'database/migrations', MIGRATION_FILE),
    join(process.cwd(), '../../database/migrations', MIGRATION_FILE),
  ];
  for (const path of candidates) {
    if (existsSync(path)) return path;
  }
  throw new Error(
    `Migration "${MIGRATION_FILE}" not found under database/migrations/.`,
  );
}

/** Ensures email_operation_verifications exists on DBs created before PR #mail-opt. */
export async function ensureEmailOperationVerifications(
  config: ConfigService,
): Promise<void> {
  const mysql = getMysqlConfig(config);
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
       WHERE table_schema = ? AND table_name = 'email_operation_verifications'`,
      [mysql.database],
    );
    const exists = Number((rows as { count: number }[])[0]?.count ?? 0) > 0;
    if (exists) {
      return;
    }

    const sql = readFileSync(resolveMigrationPath(), 'utf8');
    await connection.query(sql);
    logger.log('Created missing table email_operation_verifications');
  } finally {
    await connection.end();
  }
}
