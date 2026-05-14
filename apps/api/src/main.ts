import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = process.env.API_GLOBAL_PREFIX ?? 'api';
  app.setGlobalPrefix(globalPrefix);
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? true,
    credentials: true,
  });
  const port = Number(process.env.API_PORT ?? 3000);
  await app.listen(port);
  console.log(`API http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
