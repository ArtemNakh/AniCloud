import { IPermission } from '../../permissions/entities/permission.interface.js';
import { IUser } from '../../users/entities/user.interface.js';

export interface IRole {
  id: number;
  name: string;
  users?: IUser[];
  permissions?: IPermission[] | undefined;
  createdAt: Date;
  updatedAt: Date;
}
