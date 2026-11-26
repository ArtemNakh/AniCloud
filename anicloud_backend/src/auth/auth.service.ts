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

/**
 * Handles authentication flows including user registration, credential login,
 * refresh token rotation, and logout.
 */
@Injectable()
export class AuthService {
  /**
   * Initializes `AuthService`
   *
   * @param tokenProvider - Service responsible for signing and verifying access and refresh tokens.
   * @param hashService - Service used to compare plain-text passwords against stored hashes.
   * @param usersService - Service for querying and creating user accounts.
   * @param tokensService - Service managing persisted refresh tokens/sessions.
   */
  constructor(
    private readonly tokenProvider: TokenProvider,
    private readonly hashService: HashService,
    private readonly usersService: UsersService,
    private readonly tokensService: TokensService,
  ) {}

  /**
   * Registers a new user account if the email address is not already taken.
   *
   * Checks for an existing user by email, delegates user creation to `UsersService`,
   * and returns basic profile data for the newly created account.
   *
   * @param dto - Payload containing registration details (`username`, `password`, `email`).
   * @returns A promise resolving to an object with the created user's `id` and `email`.
   * @throws {BadRequestException} If a user with the given email already exists.
   */
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

  /**
   * Authenticates a user by email and password and issues token pairs.
   *
   * Verifies user existence and password match, generates access and refresh tokens,
   * persists the refresh token via `TokensService`, and returns tokens with user details.
   *
   * @param dto - Payload containing login credentials (`email` and `password`).
   * @returns A promise resolving to `accessToken`, `refreshToken`, and basic `user` info.
   * @throws {UnauthorizedException} If the user does not exist or the password is invalid.
   */
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

  /**
   * Rotates authentication tokens using a valid refresh token.
   *
   * Verifies the incoming refresh token signature, loads the user with roles,
   * validates the token against the stored hash, issues a new access/refresh pair,
   * and saves the replacement refresh token.
   *
   * @param oldRefreshToken - Refresh token to verify and rotate.
   * @returns A promise resolving to the newly issued `accessToken` and `refreshToken`.
   * @throws {UnauthorizedException} If the token is invalid/expired, the user is not found,
   * or the token does not match the stored token hash.
   */
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

  /**
   * Logs out a user by removing their stored refresh token.
   *
   * @param email - Email address of the user whose refresh token should be removed.
   * @returns A promise resolving to the result of `TokensService.removeRefreshToken`.
   */
  async logout(email: string) {
    // Видалення (або занулення) Refresh токена з бази даних
    return this.tokensService.removeRefreshToken(email);
  }
}
