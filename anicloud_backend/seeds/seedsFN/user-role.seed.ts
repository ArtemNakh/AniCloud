import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';

export interface SeedUserRoleInput {
  userId: number;
  roleId: number;
}

export interface SeedUserRolesOptions {
  /** Кількість випадкових зв'язків для генерації (якщо не передано staticRelations) */
  count?: number;
  /** Масив конкретних зв'язків (userId та roleId), які обов'язково треба створити */
  staticRelations?: SeedUserRoleInput[];
  /** Максимальний ID користувача для генерації випадкових зв'язків (якщо не вказано, дізнається з бази або береться за замовчуванням) */
  maxUserId?: number;
  /** Максимальний ID ролі для генерації випадкових зв'язків */
  maxRoleId?: number;
  /** Поведінка при конфлікті дублікатів: 'ignore' (пропустити) або 'update' (оновити) */
  onDuplicate?: 'ignore' | 'update';
  /** Фіксований seed для faker (для відтворюваних результатів) */
  fakerSeed?: number;
  /** Кастомний генератор зв'язків за індексом */
  customGenerator?: (index: number) => SeedUserRoleInput;
}

export async function seedUserRoles(
  dataSource: DataSource,
  options: SeedUserRolesOptions | number = {},
): Promise<void> {
  // Підтримка зворотньої сумісності, якщо передали просто число (кількість зв'язків)
  const config: SeedUserRolesOptions =
    typeof options === 'number' ? { count: options } : options;

  const {
    staticRelations = [],
    count = staticRelations.length > 0 ? 0 : 10,
    maxUserId,
    maxRoleId,
    onDuplicate = 'ignore',
    fakerSeed,
    customGenerator,
  } = config;

  if (fakerSeed !== undefined) {
    faker.seed(fakerSeed);
  }

  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    // Якщо максимуми для ID не передано, намагаємося динамічно дізнатися їх з бази
    let resolvedMaxUserId = maxUserId;
    let resolvedMaxRoleId = maxRoleId;

    if ((!resolvedMaxUserId || !resolvedMaxRoleId) && count > 0) {
      const userCountRes = await queryRunner.query(`SELECT MAX(id) as maxId FROM users;`);
      const roleCountRes = await queryRunner.query(`SELECT MAX(id) as maxId FROM roles;`);
      
      resolvedMaxUserId = resolvedMaxUserId ?? (userCountRes[0]?.maxId || 1);
      resolvedMaxRoleId = resolvedMaxRoleId ?? (roleCountRes[0]?.maxId || 1);
    }

    const relationsToInsert: SeedUserRoleInput[] = [...staticRelations];

    // Генеруємо випадкові зв'язки
    for (let i = 0; i < count; i++) {
      if (customGenerator) {
        relationsToInsert.push(customGenerator(i));
      } else {
        relationsToInsert.push({
          userId: faker.number.int({ min: 1, max: resolvedMaxUserId ?? 10 }),
          roleId: faker.number.int({ min: 1, max: resolvedMaxRoleId ?? 3 }),
        });
      }
    }

    if (relationsToInsert.length === 0) {
      console.log('No user-role relations configured to seed. Skipping...');
      return;
    }

    console.log(`Seeding ${relationsToInsert.length} user-role relations into the database...`);

    const sqlQuery =
      onDuplicate === 'ignore'
        ? `INSERT IGNORE INTO user_role (user_id, role_id) VALUES (?, ?);`
        : `INSERT INTO user_role (user_id, role_id) 
           VALUES (?, ?) 
           ON DUPLICATE KEY UPDATE 
           role_id = VALUES(role_id);`;

    for (let i = 0; i < relationsToInsert.length; i++) {
      const rel = relationsToInsert[i];

      await queryRunner.query(sqlQuery, [rel.userId, rel.roleId]);

      console.log(
        `Relation [${i + 1}/${relationsToInsert.length}] (User ID: ${rel.userId} -> Role ID: ${rel.roleId}) processed.`,
      );
    }

    console.log('User-roles seeding completed successfully.');
  } catch (error) {
    console.error('Error during user-roles seeding:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}