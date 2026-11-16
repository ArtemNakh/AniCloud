// list of permissions values
export const Permission = {
  USERS_READ: 'users:read',
  USERS_CREATE: 'users:create',
  USERS_DELETE: 'users:delete',
  ROLES_MANAGE: 'roles:manage',
};

export type Permission = (typeof Permission)[keyof typeof Permission];
