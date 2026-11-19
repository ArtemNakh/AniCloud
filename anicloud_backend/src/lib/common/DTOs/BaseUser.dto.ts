import { IRole } from '../../../roles/entities/role.interface.js';

export class BaseUserDto {
  username: string;
  email: string;
  password: string;
  role?: IRole[];
}
