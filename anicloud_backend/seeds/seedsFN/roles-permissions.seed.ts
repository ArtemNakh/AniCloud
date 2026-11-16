import { DataSource } from 'typeorm';
import { Permission } from '../../src/lib/common/permissions.enum.ts';

export interface RolePermissionMapInput {
  roleName: string;
  /**
   * Масив конкретних прав АБО ключові слова:
   * - 'ALL_ENUM' — дати всі права з enum Permission
   * - 'ALL_DB' — дати абсолютно всі права з таблиці permissions
   */
  permissions: (Permission | string)[] | 'ALL_ENUM' | 'ALL_DB';
  /** Права, які треба виключити (корисно разом із 'ALL_ENUM' або 'ALL_DB') */
  excludePermissions?: (Permission | string)[];
}

export interface SeedRolePermissionsOptions {
  /** Мапа зв'язків ролей та дозволів (за замовчуванням створює базовий пресет для admin/user) */
  mappings?: RolePermissionMapInput[];
  /**
   * Режим оновлення зв'язків для ролі:
   * - 'skip': лише додати відсутні, не видаляти старі
   * - 'clear': повністю очистити всі зв'язки ролі та записати заново
   * - 'sync': видалити зайві та додати відсутні (точна синхронізація)
   */
  mode?: 'skip' | 'clear' | 'sync';
}

export async function seedRolePermissions(
  dataSource: DataSource,
  options: SeedRolePermissionsOptions | RolePermissionMapInput[] = {},
): Promise<void> {
  const defaultMappings: RolePermissionMapInput[] = [
    { roleName: 'admin', permissions: 'ALL_ENUM' },
    { roleName: 'user', permissions: [Permission.USERS_READ] },
  ];

  const config: SeedRolePermissionsOptions = Array.isArray(options)
    ? { mappings: options }
    : options;

  const { mappings = defaultMappings, mode = 'skip' } = config;

  if (mappings.length === 0) {
    console.log('No role-permission mappings configured to seed. Skipping...');
    return;
  }

  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    // Завантажуємо всі існуючі дозволи з БД одним запитом для швидкодії
    const allDbPermissions: { id: number; name: string }[] =
      await queryRunner.query(`SELECT id, name FROM permissions;`);
    const dbPermissionMap = new Map(
      allDbPermissions.map((p) => [p.name, p.id]),
    );

    for (const mapping of mappings) {
      const { roleName, permissions, excludePermissions = [] } = mapping;

      const roleResult = await queryRunner.query(
        `SELECT id FROM roles WHERE name = ? LIMIT 1;`,
        [roleName],
      );

      if (!roleResult || roleResult.length === 0) {
        console.warn(
          `Role "${roleName}" not found in database. Skipping mapping...`,
        );
        continue;
      }

      const roleId: number = roleResult[0].id;

      // Визначаємо фінальний список назв дозволів для цієї ролі
      let resolvedNames: string[] = [];
      if (permissions === 'ALL_ENUM') {
        resolvedNames = Object.values(Permission);
      } else if (permissions === 'ALL_DB') {
        resolvedNames = allDbPermissions.map((p) => p.name);
      } else {
        resolvedNames = [...permissions];
      }

      // Відфільтровуємо виключення та дублікати
      const excludeSet = new Set<string>(excludePermissions);
      const targetPermIds = Array.from(new Set(resolvedNames))
        .filter((name) => !excludeSet.has(name))
        .map((name) => {
          const id = dbPermissionMap.get(name);
          if (!id) {
            console.warn(
              `Permission "${name}" not found in DB for role "${roleName}".`,
            );
          }
          return id;
        })
        .filter((id): id is number => id !== undefined);

      // Обробка режимів очищення/синхронізації
      if (mode === 'clear') {
        await queryRunner.query(
          `DELETE FROM roles_permissions WHERE role_id = ?;`,
          [roleId],
        );
      } else if (mode === 'sync') {
        if (targetPermIds.length === 0) {
          await queryRunner.query(
            `DELETE FROM roles_permissions WHERE role_id = ?;`,
            [roleId],
          );
        } else {
          const placeholders = targetPermIds.map(() => '?').join(', ');
          await queryRunner.query(
            `DELETE FROM roles_permissions WHERE role_id = ? AND permission_id NOT IN (${placeholders});`,
            [roleId, ...targetPermIds],
          );
        }
      }

      // Вставляємо зв'язки
      for (const permissionId of targetPermIds) {
        await queryRunner.query(
          `INSERT IGNORE INTO roles_permissions (role_id, permission_id) VALUES (?, ?);`,
          [roleId, permissionId],
        );
      }

      console.log(
        `Role "${roleName}" processed (${mode} mode): ${targetPermIds.length} permissions assigned.`,
      );
    }

    console.log('Role-permissions seeding completed successfully.');
  } catch (error) {
    console.error('Error during role-permissions seeding:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}
