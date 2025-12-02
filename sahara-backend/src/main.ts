import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: ['http://localhost:3000'], // your Next.js dev URL
      credentials: true,
    },
  });

  // All routes will be under /api/...
  app.setGlobalPrefix('api');

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 4000;

  await app.listen(port);
  console.log(`🚀 SAHARA backend running on http://localhost:${port}/api`);
}

bootstrap();
