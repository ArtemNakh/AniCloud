import { Module } from '@nestjs/common';
import { FilmsService } from './films.service.js';
import { FilmsController } from './films.controller.js';

@Module({
  controllers: [FilmsController],
  providers: [FilmsService],
})
export class FilmsModule {}
