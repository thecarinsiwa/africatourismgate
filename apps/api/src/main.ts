import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, static as serveStatic, urlencoded } from 'express';
import helmet from 'helmet';
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
  // Soft Helmet: baseline headers without CSP/COEP (avoids breaking Swagger UI / embeds).
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );
  const globalPrefix = process.env.API_GLOBAL_PREFIX ?? 'api';
  const uploadsDir = join(process.cwd(), 'uploads');
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }
  // Exposed as /api/uploads/… so nginx `location /api/` can serve branding files.
  app.use(
    `/${globalPrefix}/uploads`,
    serveStatic(uploadsDir, {
      setHeaders: (res) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
      },
    }),
  );
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

  const isProduction = process.env.NODE_ENV === 'production';
  const enableSwagger =
    process.env.ENABLE_SWAGGER === '1' || !isProduction;

  if (enableSwagger) {
    const config = new DocumentBuilder()
      .setTitle('Africa Tourism Gate API')
      .setDescription('REST API aligned with africatourismgate MySQL schema')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(globalPrefix, app, document);
  }

  const corsOrigins = (() => {
    const raw = process.env.CORS_ORIGIN?.trim();
    const origins = raw
      ? raw
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean)
      : [];

    if (origins.length > 0) {
      return origins;
    }

    // Dev/test: allow any origin when CORS_ORIGIN is unset.
    // Production: refuse to boot with an open CORS fallback.
    if (isProduction) {
      throw new Error(
        'CORS_ORIGIN must be set to a comma-separated allowlist in production (fail-closed).',
      );
    }
    return true;
  })();

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Disposition'],
  });
  const port = Number(process.env.API_PORT ?? 3000);
  await app.listen(port);
  console.log(`API http://localhost:${port}/${globalPrefix}`);
  if (enableSwagger) {
    console.log(`Swagger http://localhost:${port}/${globalPrefix}`);
  }
}

bootstrap();
