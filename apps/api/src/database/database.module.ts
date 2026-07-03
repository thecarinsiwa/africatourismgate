import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'node:path';
import * as entities from '../entities/generated';
import { BookingIdentityDocuments } from '../entities/booking-identity-document.entity';
import { EmailOperationVerifications } from '../entities/email-operation-verification.entity';
import { ensureRbacPermissions } from './ensure-rbac-permissions';
import { ensureSchema } from './ensure-schema';
import { ensureSeeds } from './ensure-seeds';

const entityList = [
  ...Object.values(entities).filter((v) => typeof v === 'function'),
  EmailOperationVerifications,
  BookingIdentityDocuments,
] as (new () => unknown)[];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Later files override earlier ones — .env.local must stay last (SMTP, secrets).
      envFilePath: [
        join(__dirname, '../../../../.env'),
        join(__dirname, '../../../../.env.local'),
      ],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        await ensureSchema(config);
        await ensureSeeds(config);
        await ensureRbacPermissions(config);
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
