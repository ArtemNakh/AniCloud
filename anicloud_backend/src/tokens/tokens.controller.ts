import { Controller} from '@nestjs/common';
import { TokensService } from './tokens.service.js';

@Controller('tokens')
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

}
