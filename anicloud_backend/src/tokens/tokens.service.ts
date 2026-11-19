import { Injectable } from '@nestjs/common';
import { Token } from './entities/token.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HashService } from '../lib/common/HashService.js';
import { TokenType } from './entities/token.interface.js';
@Injectable()
export class TokensService {
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    private readonly hashService: HashService,
  ) {}

  /**
   * Збереження або оновлення рефреш-токена для користувача за його email
   */
  public async saveRefreshToken(
    email: string,
    rawToken: string,
  ): Promise<void> {
    const hashedToken = this.hashService.hashSha256(rawToken);

    // Шукаємо, чи є вже активний рефреш-токен у таблиці для цього email
    let tokenRecord = await this.tokenRepository.findOne({
      where: { email, type: TokenType.refresh },
    });

    if (tokenRecord) {
      tokenRecord.token = hashedToken;
      await this.tokenRepository.save(tokenRecord);
    } else {
      tokenRecord = this.tokenRepository.create({
        email,
        token: hashedToken,
        type: TokenType.refresh,
      });
      await this.tokenRepository.save(tokenRecord);
    }
  }

  /**
   * Валідація вхідного рефреш-токена шляхом звірки його хешу в базі
   */
  public async validateRefreshToken(
    email: string,
    rawToken: string,
  ): Promise<boolean> {
    const tokenRecord = await this.tokenRepository.findOne({
      where: { email, type: TokenType.refresh },
    });

    if (!tokenRecord) {
      return false;
    }

    const hashedIncomingToken = this.hashService.hashSha256(rawToken);
    return tokenRecord.token === hashedIncomingToken;
  }

  /**
   * Видалення рефреш-токена (під час logout)
   */
  public async removeRefreshToken(email: string): Promise<void> {
    await this.tokenRepository.delete({ email, type: TokenType.refresh });
  }
}
