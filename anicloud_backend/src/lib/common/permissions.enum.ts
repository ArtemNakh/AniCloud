/**
 * Canonical permission identifiers used for authorization and access control.
 */
export const Permission = {
  /** Allows reading user profiles and user lists. */
  USERS_READ: 'users:read',
  /** Allows creating new user accounts. */
  USERS_CREATE: 'users:create',
  /** Allows deleting existing user accounts. */
  USERS_DELETE: 'users:delete',
  /** Allows creating, updating, or assigning roles and permissions. */
  ROLES_MANAGE: 'roles:manage',
} as const;

/**
 * Union of all valid permission string values defined in {@link Permission}.
 */
export type Permission = (typeof Permission)[keyof typeof Permission];