import { IRole } from '../../../roles/entities/role.interface.js';

/**
 * Base user data transfer object shared across user-related payloads.
 */
export class BaseUserDto {
  username: string;
  email: string;
  password: string;
  /** Assigned user roles; optional when not set or resolved on the server. */
  role?: IRole[];
}
