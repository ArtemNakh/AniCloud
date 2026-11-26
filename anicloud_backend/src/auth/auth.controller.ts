import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterReqDto } from './dto/reqeust/Register.req.dto.js';
import { LoginReqDto } from './dto/reqeust/Login.req.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Registration a new user into system
   *
   * Validate input data, create user account with default role
   *
   * @param dto- Data for registration user
   * @returns Return promuse with user data
   *
   * @throws {ConflictException} User with such data already exist
   * @throws {BadRequestException} Input data didn`t pass validation
   */
  @Post('register')
  async register(@Body() dto: RegisterReqDto) {
    return this.authService.register(dto);
  }

  /**
   * Authenticates an existing user with their credentials.
   *
   * Validates the provided login credentials against stored user records
   * and generates authentication tokens upon success.
   *
   * @param dto - User login credentials
   * @returns A promise resolving to the authentication payload.
   * @throws {UnauthorizedException} If the email does not exist or the password is invalid.
   * @throws {BadRequestException} If the request body fails DTO validation.
   */
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginReqDto) {
    return this.authService.login(dto);
  }

  /**
   * Issues a new pair of access and refresh tokens using a valid refresh token
   *
   * Verifies the provided refresh token
   * and returns refreshed authentication tokens
   *
   * @param refreshToken - Refresh token extracted from the request body
   * @returns A promise resolving to the new authentication tokens
   * @throws {UnauthorizedException} If the refresh token is missing, malformed, expired, or revoked
   * @throws {ForbiddenException} If the associated user account is inactive or restricted
   */
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refreshTokens(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshTokens(refreshToken);
  }

  /**
   * Logs out a user by invalidating or clearing their active refresh token / session
   *
   * Revokes or removes stored session/refresh state associated with the given email
   * so future token refreshes with previous refresh tokens are rejected.
   *
   * @param email - Email address of the user logging out, extracted from the request body
   * @returns A promise resolving once the logout operation completes
   * @throws {NotFoundException} If no user is found for the provided email (
   * @throws {UnauthorizedException} If the request is unauthorized or missing required auth context
   */
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Body('email') email: string) {
    return this.authService.logout(email);
  }
}
