import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterReqDto } from './dto/reqeust/Register.req.dto.js';
import { LoginReqDto } from './dto/reqeust/Login.req.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {console.log('AuthController initialized successfully!');}


  @Post('register')
  async register(@Body() dto: RegisterReqDto) {
    return this.authService.register(dto);
  }

  /**
   * Авторизація користувача (Логін)
   * POST /auth/login
   */
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginReqDto) {
    console.log("testcont")
    return this.authService.login(dto);
  }

  /**
   * Оновлення пари токенів (Refresh Token Rotation)
   * POST /auth/refresh
   */
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refreshTokens(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshTokens(refreshToken);
  }

  /**
   * Вихід із системи (Logout)
   * POST /auth/logout
   *
   * Примітка: Тут передбачено, що ви передаєте email або витягуєте його з юзера,
   * який пройшов автентифікацію (наприклад, через AuthGuard/JwtAuthGuard за допомогою @Req()).
   */
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Body('email') email: string) {
    return this.authService.logout(email);
  }
}
