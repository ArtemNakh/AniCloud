import { Controller } from '@nestjs/common';
import { ActorsService } from './actors.service.js';

@Controller('actors')
export class ActorsController {
  constructor(private readonly actorsService: ActorsService) {}
}
