import { IRole } from "../../roles/entities/role.interface.js";

export class IPermission {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;

  roles?: IRole | undefined;
}
