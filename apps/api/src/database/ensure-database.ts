import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createConnection } from 'mysql2/promise';
import { getMysqlConfig } from './mysql-config';

const logger = new Logger('DatabaseBootstrap');

/** Creates the MySQL database if it does not exist (before TypeORM connects). */
export async function ensureDatabaseExists(
  config: ConfigService,
): Promise<void> {
  const mysql = getMysqlConfig(config);

  const connection = await createConnection({
    host: mysql.host,
    port: mysql.port,
    user: mysql.user,
    password: mysql.password,
  });

  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${mysql.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
    logger.log(`Database "${mysql.database}" is ready`);
  } finally {
    await connection.end();
  }
}
