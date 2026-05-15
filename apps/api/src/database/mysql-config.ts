import { ConfigService } from '@nestjs/config';

export interface MysqlConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export function sanitizeDatabaseName(name: string): string {
  if (!/^[a-zA-Z0-9_]+$/.test(name)) {
    throw new Error(
      `Invalid DATABASE_NAME "${name}". Use only letters, numbers, and underscores.`,
    );
  }
  return name;
}

export function getMysqlConfig(config: ConfigService): MysqlConfig {
  return {
    host: config.get<string>('DATABASE_HOST', 'localhost'),
    port: Number(config.get<string>('DATABASE_PORT', '3306')),
    user: config.get<string>('DATABASE_USER', 'root'),
    password: config.get<string>('DATABASE_PASSWORD', ''),
    database: sanitizeDatabaseName(
      config.get<string>('DATABASE_NAME', 'africatourismgate'),
    ),
  };
}

export function isAutoSchemaEnabled(config: ConfigService): boolean {
  return config.get<string>('DATABASE_AUTO_SCHEMA', 'true') !== 'false';
}
