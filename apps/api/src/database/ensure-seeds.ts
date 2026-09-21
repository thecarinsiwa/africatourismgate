import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createConnection } from 'mysql2/promise';
import { getMysqlConfig, isAutoSeedEnabled } from './mysql-config';

const logger = new Logger('DatabaseBootstrap');

const PLATFORM_ORG_ID = '00000000-0000-4000-8000-000000000001';

function resolveSeedFileName(config: ConfigService): string {
  const explicit = config.get<string>('DATABASE_SEED_FILE');
  if (explicit?.trim()) {
    return explicit.trim();
  }
  const profile = (config.get<string>('SEED_PROFILE', 'dev') ?? 'dev').toLowerCase();
  if (profile === 'prod' || profile === 'production') {
    return 'install.seed.prod.sql';
  }
  return 'install.seed.sql';
}

function resolveSeedSqlPath(config: ConfigService): string {
  const seedFile = resolveSeedFileName(config);
  if (seedFile.includes('/') || seedFile.includes('\\')) {
    if (existsSync(seedFile)) return seedFile;
    throw new Error(`Seed file not found: ${seedFile}`);
  }

  const candidates = [
    join(__dirname, '../../../../database/seeds', seedFile),
    join(process.cwd(), 'database/seeds', seedFile),
    join(process.cwd(), '../../database/seeds', seedFile),
  ];
  for (const path of candidates) {
    if (existsSync(path)) return path;
  }
  throw new Error(
    `Seed file "${seedFile}" not found. Expected at database/seeds/${seedFile}.`,
  );
}

async function databaseHasPlatformOrganization(
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
       WHERE table_schema = ? AND table_name = 'organizations'`,
      [mysql.database],
    );
    const tableExists = Number((tables as { count: number }[])[0]?.count ?? 0) > 0;
    if (!tableExists) return false;

    const [rows] = await connection.query(
      `SELECT COUNT(*) AS count FROM \`organizations\`
       WHERE \`id\` = ? AND \`deleted_at\` IS NULL`,
      [PLATFORM_ORG_ID],
    );
    return Number((rows as { count: number }[])[0]?.count ?? 0) > 0;
  } finally {
    await connection.end();
  }
}

/**
 * Imports `database/seeds/install.seed.sql` when the platform organization is missing.
 */
export async function ensureSeeds(config: ConfigService): Promise<void> {
  if (!isAutoSeedEnabled(config)) {
    logger.log('DATABASE_AUTO_SEED=false — skipping seed import');
    return;
  }

  if (await databaseHasPlatformOrganization(config)) {
    logger.log('Platform organization present — skipping seed import');
    return;
  }

  const seedPath = resolveSeedSqlPath(config);
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
