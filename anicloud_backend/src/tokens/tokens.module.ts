import { Module } from '@nestjs/common';
import { TokensService } from './tokens.service.js';
import { TokensController } from './tokens.controller.js';

@Module({
  controllers: [TokensController],
  providers: [TokensService],
})
export class TokensModule {}
