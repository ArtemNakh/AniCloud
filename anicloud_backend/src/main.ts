import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { Request, Response, NextFunction } from 'express';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    abortOnError: false, // Дозволяє Nest спробувати завантажити інші модулі і показати повну картину
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Видаляє з DTO будь-які поля, яких немає в класі
      forbidNonWhitelisted: true, // Кидає помилку, якщо надіслали зайві поля
      transform: true, // Автоматично конвертує типи (наприклад, стрічку в число, якщо треба)
    }),
  );

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
void bootstrap();
