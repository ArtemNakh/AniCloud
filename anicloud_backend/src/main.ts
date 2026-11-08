import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { Request, Response, NextFunction } from 'express';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT;
  if (!port) {
    throw new Error('Error, port undefined!');
  }

  // Додаємо логування кожного вхідного HTTP-запиту
  app.use((req: Request, res: Response, next: NextFunction) => {
    const { method, originalUrl } = req;
    const startTime = Date.now();
    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - startTime;
      Logger.log(
        `[HTTP] ${method} ${originalUrl} -> Status: ${statusCode} (${duration}ms)`,
        'HTTP Request',
      );
    });

    next();
  });

  console.log('app port', port);
  await app.listen(port);
}
bootstrap();
