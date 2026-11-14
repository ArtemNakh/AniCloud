import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';

export interface SeedGenreInput {
  name: string;
  description: string;
}

export interface SeedGenresOptions {
  /** Number of random genres to generate (defaults to 10 if staticGenres are not provided) */
  count?: number;
  /** Array of specific genres that must be created */
  staticGenres?: SeedGenreInput[];
  /** Behavior on name conflict: 'update' (update description) or 'ignore' (skip). Defaults to 'update' */
  onDuplicate?: 'update' | 'ignore';
  /** Fixed seed for faker (for reproducible results) */
  fakerSeed?: number;
  /** Custom genre fields generator */
  customGenerator?: (index: number) => Partial<SeedGenreInput>;
}

export async function seedGenres(
  dataSource: DataSource,
  options: SeedGenresOptions | number = {},
): Promise<void> {
  // Підтримка зворотньої сумісності, якщо передали просто число: seedGenres(ds, 15)
  const config: SeedGenresOptions =
    typeof options === 'number' ? { count: options } : options;

  const {
    staticGenres = [],
    count = staticGenres.length > 0 ? 0 : 10,
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
    const genresToInsert: SeedGenreInput[] = [...staticGenres];

    // Генеруємо випадкові жанри (використовуємо унікальні слова для назв жанрів, щоб уникати конфліктів UNIQUE)
    for (let i = 0; i < count; i++) {
      const customData = customGenerator ? customGenerator(i) : {};

      genresToInsert.push({
        name: customData.name ?? `${faker.music.genre()}_${faker.string.alphanumeric(4)}`,
        description: customData.description ?? faker.lorem.sentence(),
      });
    }

    if (genresToInsert.length === 0) {
      console.log('No genres configured to seed. Skipping...');
      return;
    }

    console.log(`Seeding ${genresToInsert.length} genres into the database...`);

    const sqlQuery =
      onDuplicate === 'ignore'
        ? `INSERT IGNORE INTO genres (name, description) VALUES (?, ?);`
        : `INSERT INTO genres (name, description) 
           VALUES (?, ?) 
           ON DUPLICATE KEY UPDATE 
           description = VALUES(description);`;

    for (let i = 0; i < genresToInsert.length; i++) {
      const genre = genresToInsert[i];

      await queryRunner.query(sqlQuery, [genre.name, genre.description]);

      console.log(
        `Genre [${i + 1}/${genresToInsert.length}] "${genre.name}" processed (${onDuplicate}).`,
      );
    }

    console.log('Genres seeding completed successfully.');
  } catch (error) {
    console.error('Error during genres seeding:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}