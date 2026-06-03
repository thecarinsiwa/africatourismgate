import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
  type RawBodyRequest,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { Request } from 'express';
import { json, urlencoded } from 'express';
import { AppModule } from '../../src/app.module';
import { formatValidationErrors } from '../../src/common/utils/format-validation-errors';
import { ensureJwtSecrets } from '../../src/config/ensure-jwt-secrets';
import { API_PREFIX } from './constants';

export async function createE2eApp(): Promise<INestApplication> {
  ensureJwtSecrets();

  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    logger: ['error', 'warn'],
  });

  app.use(
    json({
      limit: '5mb',
      verify: (req, _res, buf) => {
        (req as RawBodyRequest<Request>).rawBody = buf;
      },
    }),
  );
  app.use(urlencoded({ extended: true, limit: '5mb' }));
  app.setGlobalPrefix(API_PREFIX);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) =>
        new BadRequestException({
          statusCode: 400,
          message: formatValidationErrors(errors),
          error: 'Requête invalide',
        }),
    }),
  );

  app.enableCors({ origin: true, credentials: true });
  await app.init();
  return app;
}
