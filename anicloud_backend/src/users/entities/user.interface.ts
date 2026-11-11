import { IRole } from '../../roles/entities/role.interface.js';

export interface IUser {
  id: number;
  username: string;
  email: string;
  password: string;
  roles: IRole[];
  createdAt: Date;
  updatedAt: Date;
}
