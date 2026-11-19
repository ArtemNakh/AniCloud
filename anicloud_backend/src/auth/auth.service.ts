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

    // 2. Хешування пароля
    const hashedPassword = await this.hashService.hashBcripto(dto.password);

    // 3. Збереження в БД
    const newUser = await this.usersService.createUser({
      ...dto,
      password: hashedPassword,
    });

    // 4. Генерація токенів
    // const payload: ITokenPayload = {
    //   sub: newUser.id,
    //   roles: newUser.roles.map((role) => role.name),
    //   permissions: [
    //     ...new Set(
    //       newUser.roles.flatMap((role) =>
    //         role.permissions
    //           ? role.permissions.map((permission) => permission.name)
    //           : [],
    //       ),
    //     ),
    //   ],
    // };

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
    const payload: ITokenPayload = {
      sub: user.id,
      roles: user.roles.map((role) => role.name),
      permissions: [
        ...new Set(
          user.roles.flatMap((role) =>
            role.permissions
              ? role.permissions.map((permission) => permission.name)
              : [],
          ),
        ),
      ],
    };
    const accessToken = this.tokenProvider.generateAccessToken(payload);
    const refreshToken = this.tokenProvider.generateRefreshToken(user.id);

    // 4. Збереження хешу Refresh токена в БД (для безпеки краще зберігати саме хеш)
    const hashedRefreshToken = this.hashService.hashSha256(refreshToken);
    await this.tokensService.saveRefreshToken(user.email, hashedRefreshToken);

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

    // 2. Пошук користувача в базі та перевірка наявності рефреш-токена
    const user = await this.usersService.findById(Number(payload.sub));
    if (!user) {
      throw new UnauthorizedException('Access Denied');
    }

    // 2. Перевірка чи збігається токен з хешем у таблиці tokens
    const isValid = await this.tokensService.validateRefreshToken(
      user.email,
      oldRefreshToken,
    );
    if (!isValid) {
      throw new UnauthorizedException('Access Denied');
    }

    // 4. Ротація: генерація нової пари токенів
    const tokenPayload: ITokenPayload = {
      sub: user.id,
      roles: user.roles.map((role: IRole) => role.name),
      permissions: [
        ...new Set(
          user.roles.flatMap((role: IRole) =>
            role.permissions
              ? role.permissions.map((permission) => permission.name)
              : [],
          ),
        ),
      ],
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
