import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

export type TokenEncoding = 'hex' | 'base64' | 'base64url';

export interface GenerateTokenOptions {
  length?: number; // Кількість байтів (за замовчуванням 32)
  encoding?: TokenEncoding; // Формат кодування (за замовчуванням 'hex')
}

@Injectable()
export class HashService {
  private readonly defaultSaltRounds = 10;
  private readonly defaultTokenLength = 32;
  /**
   * 1. Хешування пароля за допомогою bcrypt
   */
  public async hashBcripto(value: string): Promise<string> {
    return bcrypt.hash(value, this.defaultSaltRounds);
  }

  /**
   * 2. Порівняння пароля з його хешем
   */
  public async comparePassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * 3. Хешування даних за допомогою SHA-256
   */
  public hashSha256(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * 4. Перевірка чи є рядок валідним bcrypt хешем
   */
  public isBcryptHash(value: string): boolean {
    const bcryptRegex = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;
    return bcryptRegex.test(value);
  }

  /**
   * 5. Єдиний універсальний генератор випадкових токенів
   * Дозволяє налаштовувати довжину та кодування «на льоту»
   */
  public generateRandomToken(options?: GenerateTokenOptions): string {
    const length = options?.length ?? this.defaultTokenLength;
    const encoding = options?.encoding ?? 'hex';

    return crypto.randomBytes(length).toString(encoding);
  }
}
