import { IRole } from '../../../roles/entities/role.interface.js';
import { IUser } from '../../entities/user.interface.js';

export class UserResponseDto {
  id: number;
  username: string;
  email: string;
  roles: IRole[];
  createdAt: Date;
  updatedAt: Date;

  constructor(user: IUser) {
    this.id = user.id;
    this.username = user.username;
    this.email = user.email;
    this.roles = user.roles;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}
