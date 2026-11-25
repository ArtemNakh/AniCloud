import { IPermission } from '../../permissions/entities/permission.interface.js';
import { IUser } from '../../users/entities/user.interface.js';

export interface IRole {
  id: number;
  name: RoleName;
  users?: IUser[];
  permissions?: IPermission[] | undefined;
  createdAt: Date;
  updatedAt: Date;
}

export enum RoleName {
  USER = 'USER',
  ADMINCONTENT = 'ADMIN_CONTENT',
  ADMINCHATS = 'ADMIN_CHATS',
  ADMINUSER = 'ADMIN_USER',
}
