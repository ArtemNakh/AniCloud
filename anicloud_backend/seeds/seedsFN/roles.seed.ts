import { DataSource } from 'typeorm';

export async function seedRoles(
  dataSource: DataSource,
  defaultRoles: string[],
): Promise<void> {
  const queryRunner = dataSource.createQueryRunner();

  await queryRunner.connect();

  try {
    console.log('Seeding roles into the database...');

    for (const roleName of defaultRoles) {
      // Використовуємо INSERT IGNORE або ON DUPLICATE KEY UPDATE для ідемпотентності в MySQL
      await queryRunner.query(
        `INSERT INTO roles (name) VALUES (?) ON DUPLICATE KEY UPDATE name = name;`,
        [roleName],
      );
      console.log(`Role "${roleName}" processed successfully.`);
    }
  } catch (error) {
    console.error('Error during roles seeding:', error);
    throw error;
  } finally {
    // Обов'язково звільняємо queryRunner
    await queryRunner.release();
  }
}
