import { IUser } from '../../users/entities/user.interface.js';

export interface IRole {
  id: number;
  name: string;
  users?: IUser[];
  createdAt: Date;
  updatedAt: Date;
}
