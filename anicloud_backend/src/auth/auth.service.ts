import { Injectable } from '@nestjs/common';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service.js';
import { TokenProvider } from '../tokens/TokenProvider.js';
import { HashService } from '../lib/common/HashService.js';
import { RegisterPayloadDto } from './dto/service/Register.payload.dto.js';
import { ITokenPayload } from '../tokens/interfaces/TokensProvider.interface.js';
import { TokensService } from '../tokens/tokens.service.js';
import { IRole } from '../roles/entities/role.interface.js';
import { LoginPayloadDto } from './dto/service/Login.payload.dto.js';

@Injectable()
export class AuthService {
  // Залежності передаються через конструктор (Dependency Injection)
  constructor(
    private readonly tokenProvider: TokenProvider,
    private readonly hashService: HashService,
    private readonly usersService: UsersService,
    private readonly tokensService: TokensService,
  ) {}

  async register(dto: RegisterPayloadDto) {
    // 1. Перевірка, чи існує користувач
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }
    // 3. Збереження в БД
    const newUser = await this.usersService.createUser({
      username: dto.username,
      password: dto.password,
      email: dto.email,
    });

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
      },
    };
  }

  async login(dto: LoginPayloadDto) {
    // 1. Пошук користувача за email
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 2. Порівняння паролів (bcrypt.compare)
    const isPasswordValid = await this.hashService.comparePassword(
      dto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 3. Генерація Access та Refresh токенів
    const roles = user.roles?.map((role) => role.name).filter(Boolean) ?? [];

    const payload: ITokenPayload = {
      sub: user.id,
      ...(roles.length > 0 && { roles }),
    };

    const accessToken = this.tokenProvider.generateAccessToken(payload);
    const refreshToken = this.tokenProvider.generateRefreshToken(user.id);

    // 4. Збереження хешу Refresh токена в БД (для безпеки краще зберігати саме хеш)
    await this.tokensService.saveRefreshToken(user.email, refreshToken);

    // 5. Повернення токенів та даних користувача
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async refreshTokens(oldRefreshToken: string) {
    // 1. Верифікація старого рефреш-токена (TokenService викине UnauthorizedException, якщо він невалідний)
    const payload = this.tokenProvider.verifyRefreshToken(oldRefreshToken);
    console.log('payload', payload);
    // 2. Пошук користувача в базі та перевірка наявності рефреш-токена
    const user = await this.usersService.findById(Number(payload.sub), {
      relations: { roles: true },
    });
    console.log('user', user);
    if (!user) {
      throw new UnauthorizedException('Access Denied');
    }

    // 2. Перевірка чи збігається токен з хешем у таблиці tokens
    const isValid = await this.tokensService.validateRefreshToken(
      user.email,
      oldRefreshToken,
    );
    console.log('isvalid', isValid);
    if (!isValid) {
      throw new UnauthorizedException('Access Denied');
    }

    // 4. Ротація: генерація нової пари токенів
    const tokenPayload: ITokenPayload = {
      sub: user.id,
      roles: user.roles.map((role: IRole) => role.name),
    };
    const accessToken = this.tokenProvider.generateAccessToken(tokenPayload);
    const newRefreshToken = this.tokenProvider.generateRefreshToken(user.id);

    // 5. Збереження нового хешу в БД
    await this.tokensService.saveRefreshToken(user.email, newRefreshToken);

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(email: string) {
    // Видалення (або занулення) Refresh токена з бази даних
    return this.tokensService.removeRefreshToken(email);
  }
}
