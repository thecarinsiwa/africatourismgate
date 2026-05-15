import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createConnection } from 'mysql2/promise';
import { getMysqlConfig, isAutoSeedEnabled } from './mysql-config';

const logger = new Logger('DatabaseBootstrap');

const SEED_FILE = 'install.seed.sql';

function resolveSeedSqlPath(): string {
  const candidates = [
    join(__dirname, '../../../../database/seeds', SEED_FILE),
    join(process.cwd(), 'database/seeds', SEED_FILE),
    join(process.cwd(), '../../database/seeds', SEED_FILE),
  ];
  for (const path of candidates) {
    if (existsSync(path)) return path;
  }
  throw new Error(
    `Seed file "${SEED_FILE}" not found. Expected at database/seeds/${SEED_FILE}.`,
  );
}

async function databaseHasSeedUsers(
  config: ConfigService,
): Promise<boolean> {
  const mysql = getMysqlConfig(config);
  const connection = await createConnection({
    host: mysql.host,
    port: mysql.port,
    user: mysql.user,
    password: mysql.password,
    database: mysql.database,
  });

  try {
    const [tables] = await connection.query(
      `SELECT COUNT(*) AS count
       FROM information_schema.tables
       WHERE table_schema = ? AND table_name = 'users'`,
      [mysql.database],
    );
    const tableExists = Number((tables as { count: number }[])[0]?.count ?? 0) > 0;
    if (!tableExists) return false;

    const [rows] = await connection.query(
      `SELECT COUNT(*) AS count FROM \`users\` WHERE \`deleted_at\` IS NULL`,
    );
    return Number((rows as { count: number }[])[0]?.count ?? 0) > 0;
  } finally {
    await connection.end();
  }
}

/**
 * Imports `database/seeds/install.seed.sql` when the `users` table is empty.
 */
export async function ensureSeeds(config: ConfigService): Promise<void> {
  if (!isAutoSeedEnabled(config)) {
    logger.log('DATABASE_AUTO_SEED=false — skipping seed import');
    return;
  }

  if (await databaseHasSeedUsers(config)) {
    logger.log('Seed data already present — skipping seed import');
    return;
  }

  const seedPath = resolveSeedSqlPath();
  const sql = readFileSync(seedPath, 'utf8');
  const mysql = getMysqlConfig(config);

  logger.log(`Importing seeds from ${seedPath}…`);

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
    logger.log('Installation seeds imported successfully');
    logger.warn(
      'Default admin: admin@africatourismgate.local / ChangeMe123! — change password after first login',
    );
  } finally {
    await connection.end();
  }
}
