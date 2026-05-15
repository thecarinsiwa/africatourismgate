import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createConnection } from 'mysql2/promise';

const logger = new Logger('DatabaseBootstrap');

function sanitizeDatabaseName(name: string): string {
  if (!/^[a-zA-Z0-9_]+$/.test(name)) {
    throw new Error(
      `Invalid DATABASE_NAME "${name}". Use only letters, numbers, and underscores.`,
    );
  }
  return name;
}

/** Creates the MySQL database if it does not exist (before TypeORM connects). */
export async function ensureDatabaseExists(
  config: ConfigService,
): Promise<void> {
  const host = config.get<string>('DATABASE_HOST', 'localhost');
  const port = Number(config.get<string>('DATABASE_PORT', '3306'));
  const user = config.get<string>('DATABASE_USER', 'root');
  const password = config.get<string>('DATABASE_PASSWORD', '');
  const database = sanitizeDatabaseName(
    config.get<string>('DATABASE_NAME', 'africatourismgate'),
  );

  const connection = await createConnection({
    host,
    port,
    user,
    password,
  });

  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
    logger.log(`Database "${database}" is ready`);
  } finally {
    await connection.end();
  }
}
