import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';

export interface SeedUserInput {
  username: string;
  email: string;
  password: string;
}

export interface SeedUsersOptions {
  /** Number of random users to generate (defaults to 10 if staticUsers are not provided) */
  count?: number;
  /** Array of specific users that must be created */
  staticUsers?: SeedUserInput[];
  /** Shared password for all generated users (if not specified, a random one is generated) */
  defaultPassword?: string;
  /** Function to hash the password before saving to the DB (e.g., bcrypt.hash) */
  hashPasswordFn?: (plainPassword: string) => Promise<string> | string;
  /** Behavior on email conflict: 'update' (update data) or 'ignore' (skip). Defaults to 'update' */
  onDuplicate?: 'update' | 'ignore';
  /** Fixed seed for faker (for reproducible results) */
  fakerSeed?: number;
  /** Custom user fields generator */
  customGenerator?: (index: number) => Partial<SeedUserInput>;
}

export async function seedUsers(
  dataSource: DataSource,
  options: SeedUsersOptions | number = {},
): Promise<void> {
  // Підтримка зворотньої сумісності, якщо передали просто число: seedUsers(ds, 15)
  const config: SeedUsersOptions =
    typeof options === 'number' ? { count: options } : options;

  const {
    staticUsers = [],
    count = staticUsers.length > 0 ? 0 : 10,
    defaultPassword,
    hashPasswordFn,
    onDuplicate = 'update',
    fakerSeed,
    customGenerator,
  } = config;

  if (fakerSeed !== undefined) {
    faker.seed(fakerSeed);
  }

  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    const usersToInsert: SeedUserInput[] = [...staticUsers];

    // Генеруємо випадкових користувачів
    for (let i = 0; i < count; i++) {
      const customData = customGenerator ? customGenerator(i) : {};

      usersToInsert.push({
        username: customData.username ?? faker.internet.username(),
        email: customData.email ?? faker.internet.email(),
        password:
          customData.password ?? defaultPassword ?? faker.internet.password(),
      });
    }

    if (usersToInsert.length === 0) {
      console.log('No users configured to seed. Skipping...');
      return;
    }

    console.log(`Seeding ${usersToInsert.length} users into the database...`);

    const sqlQuery =
      onDuplicate === 'ignore'
        ? `INSERT IGNORE INTO users (username, email, password) VALUES (?, ?, ?);`
        : `INSERT INTO users (username, email, password) 
           VALUES (?, ?, ?) 
           ON DUPLICATE KEY UPDATE 
           username = VALUES(username), 
           password = VALUES(password);`;

    for (let i = 0; i < usersToInsert.length; i++) {
      const user = usersToInsert[i];
      const finalPassword = hashPasswordFn
        ? await hashPasswordFn(user.password)
        : user.password;

      await queryRunner.query(sqlQuery, [
        user.username,
        user.email,
        finalPassword,
      ]);

      console.log(
        `User [${i + 1}/${usersToInsert.length}] "${user.email}" processed (${onDuplicate}).`,
      );
    }

    console.log('Users seeding completed successfully.');
  } catch (error) {
    console.error('Error during users seeding:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}