import { Controller} from '@nestjs/common';
import { GenresService } from './genres.service.js';
@Controller('genres')
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

}
