import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import {
  ITokenPayload,
  ITokenService,
} from './interfaces/TokensProvider.interface.js';

/**
 * Signs, verifies, and calculates expiration timestamps for JWT access and refresh tokens
 */
@Injectable()
export class TokenProvider implements ITokenService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessExpiresIn: string;
  private readonly refreshExpiresIn: string;

  /**
   * Initializes `TokenProvider` and validates required JWT environment variables
   *
   * @param jwtService - NestJS JWT service used to sign and verify tokens
   * @param configService - Configuration service providing JWT secrets and TTL values
   * @throws {Error} If `JWT_SECRET` or `JWT_REFRESH_SECRET` is missing in configuration
   */
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    const accessSecret = this.configService.get<string>('JWT_SECRET');
    if (!accessSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables!');
    }
    this.accessSecret = accessSecret;

    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    if (!refreshSecret) {
      throw new Error(
        'JWT_REFRESH_SECRET is not defined in environment variables!',
      );
    }
    this.refreshSecret = refreshSecret;

    this.accessExpiresIn =
      this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m';
    this.refreshExpiresIn =
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';
  }

  /**
   * Signs and returns a short-lived JWT access token
   *
   * @param user - Token payload containing subject and optional authorization claims
   * @returns Signed JWT access token string
   */
  public generateAccessToken(user: ITokenPayload): string {
    return this.jwtService.sign(user, {
      secret: this.accessSecret,
      expiresIn: this.accessExpiresIn as JwtSignOptions['expiresIn'],
    });
  }

  /**
   * Signs and returns a refresh token containing the subject identifier
   *
   * @param userId - User identifier stored as the JWT `sub` claim
   * @returns Signed JWT refresh token string
   */
  public generateRefreshToken(userId: number | string): string {
    const payload = { sub: userId };
    return this.jwtService.sign(payload, {
      secret: this.refreshSecret,
      expiresIn: this.refreshExpiresIn as JwtSignOptions['expiresIn'],
    });
  }

  /**
   * Verifies an access token and returns its typed payload
   *
   * @param token - JWT access token string to verify
   * @returns Decoded {@link ITokenPayload} from the valid token
   * @throws {UnauthorizedException} If the token signature is invalid or expired
   */
  public verifyAccessToken(token: string): ITokenPayload {
    try {
      return this.jwtService.verify<ITokenPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  /**
   * Verifies a refresh token using the dedicated refresh secret
   *
   * @param token - JWT refresh token string to verify
   * @returns Object containing the decoded `sub` subject identifier
   * @throws {UnauthorizedException} If the token signature is invalid or expired
   */
  public verifyRefreshToken(token: string): { sub: number | string } {
    try {
      return this.jwtService.verify<{ sub: number | string }>(token, {
        secret: this.refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * Calculates a future `Date` from a duration string or numeric seconds value
   *
   * Supports plain second counts (such as `"604800"`) and unit suffixes
   * (`s`, `m`, `h`, `d`, `w`)
   *
   * @param expiresIn - Duration string to parse; defaults to `refreshExpiresIn`
   * @param fallback - Fallback duration string used when `expiresIn` is empty
   * @returns Computed expiration `Date` relative to `Date.now()`
   * @throws {Error} If the duration string does not match a supported format
   */
  public getExpirationDate(
    expiresIn: string = this.refreshExpiresIn,
    fallback = '7d',
  ): Date {
    const raw = (expiresIn || fallback).trim();

    // Якщо в .env вказано просто число секунд, наприклад "604800"
    if (/^\d+$/.test(raw)) {
      return new Date(Date.now() + Number(raw) * 1000);
    }

    const match = raw.match(/^(\d+)\s*(s|m|h|d|w)$/i);
    if (!match) {
      throw new Error(`Invalid duration format: "${expiresIn}"`);
    }

    const value = Number(match[1]);
    const unit = match[2].toLowerCase();

    const unitToMs: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
      w: 7 * 24 * 60 * 60 * 1000,
    };

    return new Date(Date.now() + value * unitToMs[unit]);
  }
}
