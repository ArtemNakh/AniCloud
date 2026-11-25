import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { TokensModule } from '../tokens/tokens.module.js';
import { UsersModule } from '../users/users.module.js';
import { HashService } from '../lib/common/HashService.js';

@Module({
  imports: [UsersModule, TokensModule],
  controllers: [AuthController],
  providers: [AuthService, HashService],
})
export class AuthModule {}
