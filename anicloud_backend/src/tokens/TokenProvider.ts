import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import {
  ITokenPayload,
  ITokenService,
} from './interfaces/TokensProvider.interface.js';

@Injectable()
export class TokenProvider implements ITokenService {
  private readonly refreshSecret: string;
  private readonly accessExpiresIn: string;
  private readonly refreshExpiresIn: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    // 1. Валідація та зчитування секретів
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    if (!refreshSecret) {
      throw new Error(
        'JWT_REFRESH_SECRET is not defined in environment variables!',
      );
    }
    this.refreshSecret = refreshSecret;

    // 2. Зчитування часу життя з env із дефолтними значеннями (fallback)
    this.accessExpiresIn =
      this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m';
    this.refreshExpiresIn =
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';
  }

  /**
   * Генерація Access Token з айді, роллю та дозволами
   */
  public generateAccessToken(user: ITokenPayload): string {
    return this.jwtService.sign(user, {
      expiresIn: this.accessExpiresIn as JwtSignOptions['expiresIn'],
    });
  }

  /**
   * Генерація Refresh Token
   */
  public generateRefreshToken(userId: number | string): string {
    const payload = { sub: userId };
    return this.jwtService.sign(payload, {
      secret: this.refreshSecret,
      expiresIn: this.refreshExpiresIn as JwtSignOptions['expiresIn'],
    });
  }

  /**
   * Перевірка Access Token із поверненням типізованого payload
   */
  public verifyAccessToken(token: string): ITokenPayload {
    try {
      return this.jwtService.verify<ITokenPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
  /**
   * Перевірка Refresh Token
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
}
