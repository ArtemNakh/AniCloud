import { Controller} from '@nestjs/common';
import { PermissionsService } from './permissions.service.js';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

}
