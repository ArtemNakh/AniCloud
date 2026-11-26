import { Injectable } from '@nestjs/common';
import { Token } from './entities/token.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HashService } from '../lib/common/HashService.js';
import { TokenType } from './entities/token.interface.js';
import { ConfigService } from '@nestjs/config';
import { TokenProvider } from './TokenProvider.js';

/**
 * Manages persisted refresh tokens in the database, including creation
 * rotation updates, hash validation, and revocation on logout
 */
@Injectable()
export class TokensService {
  /**
   * Initializes `TokensService` with repository, hashing, configuration, and token utilities
   *
   * @param tokenRepository - TypeORM repository for {@link Token} records
   * @param hashService - Service used to hash raw tokens before persistence or comparison
   * @param configService - Configuration service providing token expiration settings
   * @param tokenProvider - Provider used to calculate token expiration dates
   */
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    private readonly hashService: HashService,
    private readonly configService: ConfigService,
    private readonly tokenProvider: TokenProvider,
  ) {}

  /**
   * Creates or updates the stored refresh token hash for a user identified by email
   *
   * Hashes the raw token with SHA-256 before saving. If a refresh token record
   * already exists for the email, its hash is updated; otherwise a new record
   * with an expiration timestamp is created
   *
   * @param email - User email address associated with the refresh token
   * @param rawToken - Plain refresh token string to hash and persist
   * @returns A promise that resolves once the token record is saved
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
      const expiresAt = this.tokenProvider.getExpirationDate(
        this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
        '7d',
      );

      tokenRecord = this.tokenRepository.create({
        email,
        token: hashedToken,
        type: TokenType.refresh,
        expiresAt, // Date -> запишеться у DATETIME колонки expires_at
      });

      await this.tokenRepository.save(tokenRecord);
    }
  }

  /**
   * Validates an incoming refresh token against the stored hash for the given email
   *
   * @param email - User email address associated with the stored refresh token
   * @param rawToken - Incoming refresh token string to verify
   * @returns A promise resolving to `true` if a matching token record exists, or `false` otherwise
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
   * Deletes the stored refresh token record for the given email (e.g., on logout)
   *
   * @param email - User email address whose refresh token should be removed
   * @returns A promise that resolves once the deletion query completes
   */
  public async removeRefreshToken(email: string): Promise<void> {
    await this.tokenRepository.delete({ email, type: TokenType.refresh });
  }
}
