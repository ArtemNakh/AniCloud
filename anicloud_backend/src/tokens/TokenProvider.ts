import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import {
  ITokenPayload,
  ITokenService,
} from './interfaces/TokensProvider.interface.js';
@Injectable()
export class TokenProvider implements ITokenService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessExpiresIn: string;
  private readonly refreshExpiresIn: string;

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

  public generateAccessToken(user: ITokenPayload): string {
    return this.jwtService.sign(user, {
      secret: this.accessSecret,
      expiresIn: this.accessExpiresIn as JwtSignOptions['expiresIn'],
    });
  }

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
