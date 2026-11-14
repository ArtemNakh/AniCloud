import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';

export interface SeedFilmInput {
  title: string;
  description: string;
  logoLink?: string | null;
  trailer_link?: string | null;
}

export interface SeedFilmsOptions {
  /** Number of random films to generate (defaults to 10 if staticFilms are not provided) */
  count?: number;
  /** Array of specific films that must be created */
  staticFilms?: SeedFilmInput[];
  /** Behavior on duplicate/conflict: 'insert' or 'update' */
  onDuplicate?: 'insert' | 'update';
  /** Fixed seed for faker (for reproducible results) */
  fakerSeed?: number;
  /** Custom film fields generator */
  customGenerator?: (index: number) => Partial<SeedFilmInput>;
}

export async function seedFilms(
  dataSource: DataSource,
  options: SeedFilmsOptions | number = {},
): Promise<void> {
  // Підтримка зворотньої сумісності, якщо передали просто число: seedFilms(ds, 15)
  const config: SeedFilmsOptions =
    typeof options === 'number' ? { count: options } : options;

  const {
    staticFilms = [],
    count = staticFilms.length > 0 ? 0 : 10,
    fakerSeed,
    customGenerator,
  } = config;

  if (fakerSeed !== undefined) {
    faker.seed(fakerSeed);
  }

  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    const filmsToInsert: SeedFilmInput[] = [...staticFilms];

    // Генеруємо випадкові фільми
    for (let i = 0; i < count; i++) {
      const customData = customGenerator ? customGenerator(i) : {};

      filmsToInsert.push({
        title: customData.title ?? faker.lorem.words(3),
        description: customData.description ?? faker.lorem.paragraph(),
        logoLink: customData.logoLink ?? faker.image.url(),
        trailer_link: customData.trailer_link ?? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      });
    }

    if (filmsToInsert.length === 0) {
      console.log('No films configured to seed. Skipping...');
      return;
    }

    console.log(`Seeding ${filmsToInsert.length} films into the database...`);

    const sqlQuery = `INSERT INTO films (title, description, logoLink, trailer_link) VALUES (?, ?, ?, ?);`;

    for (let i = 0; i < filmsToInsert.length; i++) {
      const film = filmsToInsert[i];

      await queryRunner.query(sqlQuery, [
        film.title,
        film.description,
        film.logoLink ?? null,
        film.trailer_link ?? null,
      ]);

      console.log(
        `Film [${i + 1}/${filmsToInsert.length}] "${film.title}" processed successfully.`,
      );
    }

    console.log('Films seeding completed successfully.');
  } catch (error) {
    console.error('Error during films seeding:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}