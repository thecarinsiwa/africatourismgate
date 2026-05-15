import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as entities from '../entities/generated';

const entityList = Object.values(entities).filter(
  (v) => typeof v === 'function',
) as (new () => unknown)[];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DATABASE_HOST', 'localhost'),
        port: config.get<number>('DATABASE_PORT', 3306),
        username: config.get<string>('DATABASE_USER', 'root'),
        password: config.get<string>('DATABASE_PASSWORD', ''),
        database: config.get<string>('DATABASE_NAME', 'africatourismgate'),
        entities: entityList,
        synchronize: false,
        logging: config.get<string>('DATABASE_LOGGING') === 'true',
        charset: 'utf8mb4',
      }),
    }),
    TypeOrmModule.forFeature(entityList),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
