import { Module } from '@nestjs/common';
import { TokensService } from './tokens.service.js';
import { TokensController } from './tokens.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from './entities/token.entity.js';
import { HashService } from '../lib/common/HashService.js';
import { TokenProvider } from './TokenProvider.js';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Token])],
  controllers: [TokensController],
  providers: [TokensService, HashService, TokenProvider, JwtService],
  exports: [TokensService, TokenProvider],
})
export class TokensModule {}
