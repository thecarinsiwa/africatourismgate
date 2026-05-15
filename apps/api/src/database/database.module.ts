import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'node:path';
import * as entities from '../entities/generated';
import { ensureDatabaseExists } from './ensure-database';

const entityList = Object.values(entities).filter(
  (v) => typeof v === 'function',
) as (new () => unknown)[];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(__dirname, '../../../.env'),
        join(__dirname, '../../../.env.local'),
        '.env',
      ],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        await ensureDatabaseExists(config);
        return {
          type: 'mysql' as const,
          host: config.get<string>('DATABASE_HOST', 'localhost'),
          port: Number(config.get<string>('DATABASE_PORT', '3306')),
          username: config.get<string>('DATABASE_USER', 'root'),
          password: config.get<string>('DATABASE_PASSWORD', ''),
          database: config.get<string>('DATABASE_NAME', 'africatourismgate'),
          entities: entityList,
          synchronize: false,
          logging: config.get<string>('DATABASE_LOGGING') === 'true',
          charset: 'utf8mb4',
        };
      },
    }),
    TypeOrmModule.forFeature(entityList),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
