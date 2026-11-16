import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { Permission } from '../../src/lib/common/permissions.enum.ts';

export interface SeedPermissionInput {
  name: string;
  description?: string | null;
}

export interface SeedPermissionsOptions {
  /**
   * Чи брати дозволи автоматично з enum Permission (за замовчуванням true, якщо не передано staticPermissions)
   */
  useEnum?: boolean;
  /** Масив дозволів для виключення з enum (якщо useEnum: true) */
  excludeFromEnum?: Permission[];
  /** Кастомні описи для конкретних прав з enum */
  enumDescriptions?: Partial<Record<Permission, string>>;
  /** Додаткові або повністю кастомні дозволи (поверх або замість enum) */
  staticPermissions?: SeedPermissionInput[];
  /** Кількість випадкових (фейкових) дозволів для тестування навантаження (за замовчуванням 0) */
  randomCount?: number;
  /** Стратегія поведінки при дублікатах унікального поля name */
  onDuplicate?: 'skip' | 'update';
  /** Фіксований seed для faker (для відтворюваних результатів) */
  fakerSeed?: number;
  /** Автоматично генерувати опис, якщо він не переданий */
  generateDescriptions?: boolean;
  /** Кастомний генератор для випадкових прав */
  customGenerator?: (index: number) => Partial<SeedPermissionInput>;
}

export async function seedPermissions(
  dataSource: DataSource,
  options: SeedPermissionsOptions | SeedPermissionInput[] | Permission[] = {},
): Promise<void> {
  // Підтримка передачі простого масиву рядків/enum або об'єктів
  let config: SeedPermissionsOptions;
  if (Array.isArray(options)) {
    const mapped: SeedPermissionInput[] = options.map((item) =>
      typeof item === 'string' ? { name: item } : item,
    );
    config = { useEnum: false, staticPermissions: mapped };
  } else {
    config = options;
  }

  const {
    useEnum = config.staticPermissions === undefined,
    excludeFromEnum = [],
    enumDescriptions = {},
    staticPermissions = [],
    randomCount = 0,
    onDuplicate = 'skip',
    fakerSeed,
    generateDescriptions = true,
    customGenerator,
  } = config;

  if (fakerSeed !== undefined) {
    faker.seed(fakerSeed);
  }

  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    const permissionsMap = new Map<string, SeedPermissionInput>();

    // 1. Додаємо дозволи з enum Permission
    if (useEnum) {
      for (const permValue of Object.values(Permission)) {
        if (excludeFromEnum.includes(permValue)) continue;

        permissionsMap.set(permValue, {
          name: permValue,
          description:
            enumDescriptions[permValue] ?? `System permission: ${permValue}`,
        });
      }
    }

    // 2. Додаємо або перезаписуємо статично передані дозволи
    for (const staticPerm of staticPermissions) {
      permissionsMap.set(staticPerm.name, staticPerm);
    }

    // 3. Генеруємо випадкові права, якщо вказано randomCount > 0
    for (let i = 0; i < randomCount; i++) {
      const custom = customGenerator ? customGenerator(i) : {};
      const randomName =
        custom.name ??
        `${faker.word.noun()}:${faker.helpers.arrayElement(['read', 'create', 'update', 'delete'])}_${i}`;

      permissionsMap.set(randomName, {
        name: randomName,
        description: custom.description ?? faker.lorem.sentence(),
      });
    }

    const permissionsToInsert = Array.from(permissionsMap.values());

    if (permissionsToInsert.length === 0) {
      console.log('No permissions configured to seed. Skipping...');
      return;
    }

    console.log(
      `Seeding ${permissionsToInsert.length} permissions into the database...`,
    );

    const sqlQuery =
      onDuplicate === 'update'
        ? `INSERT INTO permissions (name, description) VALUES (?, ?) ON DUPLICATE KEY UPDATE description = VALUES(description), updated_at = CURRENT_TIMESTAMP;`
        : `INSERT IGNORE INTO permissions (name, description) VALUES (?, ?);`;

    for (let i = 0; i < permissionsToInsert.length; i++) {
      const perm = permissionsToInsert[i];
      const description =
        perm.description ??
        (generateDescriptions ? faker.lorem.sentence() : null);

      await queryRunner.query(sqlQuery, [perm.name, description]);
      console.log(
        `Permission [${i + 1}/${permissionsToInsert.length}] "${perm.name}" processed.`,
      );
    }

    console.log('Permissions seeding completed successfully.');
  } catch (error) {
    console.error('Error during permissions seeding:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}
