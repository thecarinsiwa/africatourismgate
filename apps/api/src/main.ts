import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, static as serveStatic, urlencoded } from 'express';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { AppModule } from './app.module';
import { formatValidationErrors } from './common/utils/format-validation-errors';
import { ensureJwtSecrets } from './config/ensure-jwt-secrets';
import { getEmailAssetsDir } from './modules/email/email-attachments';

async function bootstrap() {
  ensureJwtSecrets();
  const app = await NestFactory.create(AppModule, { rawBody: true });
  // Behind nginx: honor X-Forwarded-Proto so req.protocol is https in production.
  app.getHttpAdapter().getInstance().set('trust proxy', 1);
  const globalPrefix = process.env.API_GLOBAL_PREFIX ?? 'api';
  const uploadsDir = join(process.cwd(), 'uploads');
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }
  // Exposed as /api/uploads/… so nginx `location /api/` can serve branding files.
  app.use(`/${globalPrefix}/uploads`, serveStatic(uploadsDir));
  const emailAssetsDir = getEmailAssetsDir();
  if (emailAssetsDir) {
    app.use(`/${globalPrefix}/email-assets`, serveStatic(emailAssetsDir));
  }
  app.use(json({ limit: '5mb' }));
  app.use(urlencoded({ extended: true, limit: '5mb' }));
  app.setGlobalPrefix(globalPrefix);

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

  const config = new DocumentBuilder()
    .setTitle('Africa Tourism Gate API')
    .setDescription('REST API aligned with africatourismgate MySQL schema')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(globalPrefix, app, document);

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? true,
    credentials: true,
  });
  const port = Number(process.env.API_PORT ?? 3000);
  await app.listen(port);
  console.log(`API http://localhost:${port}/${globalPrefix}`);
  console.log(`Swagger http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
