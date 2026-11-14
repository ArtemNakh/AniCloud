import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';

export interface SeedFilmGenreInput {
  filmId: number;
  genreId: number;
}

export interface SeedFilmsGenresOptions {
  /** Number of random film-genre relations to generate (defaults to 10 if staticRelations are not provided) */
  count?: number;
  /** Array of specific relations that must be created */
  staticRelations?: SeedFilmGenreInput[];
  /** Maximum film ID for generating random relations (if not specified, auto-fetched from database) */
  maxFilmId?: number;
  /** Maximum genre ID for generating random relations (if not specified, auto-fetched from database) */
  maxGenreId?: number;
  /** Behavior on duplicate/conflict: 'ignore' (skip) or 'update' */
  onDuplicate?: 'ignore' | 'update';
  /** Fixed seed for faker (for reproducible results) */
  fakerSeed?: number;
  /** Custom relation fields generator */
  customGenerator?: (index: number) => SeedFilmGenreInput;
}

export async function seedFilmsGenres(
  dataSource: DataSource,
  options: SeedFilmsGenresOptions | number = {},
): Promise<void> {
  // Підтримка зворотньої сумісності, якщо передали просто число (кількість зв'язків)
  const config: SeedFilmsGenresOptions =
    typeof options === 'number' ? { count: options } : options;

  const {
    staticRelations = [],
    count = staticRelations.length > 0 ? 0 : 10,
    maxFilmId,
    maxGenreId,
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
    let resolvedMaxFilmId = maxFilmId;
    let resolvedMaxGenreId = maxGenreId;

    // Якщо максимальні ID не передані, динамічно запитуємо їх з бази
    if ((!resolvedMaxFilmId || !resolvedMaxGenreId) && count > 0) {
      const filmRes = await queryRunner.query(`SELECT MAX(id) as maxId FROM films;`);
      const genreRes = await queryRunner.query(`SELECT MAX(id) as maxId FROM genres;`);

      resolvedMaxFilmId = resolvedMaxFilmId ?? (filmRes[0]?.maxId || 1);
      resolvedMaxGenreId = resolvedMaxGenreId ?? (genreRes[0]?.maxId || 1);
    }

    const relationsToInsert: SeedFilmGenreInput[] = [...staticRelations];

    // Генеруємо випадкові зв'язки
    for (let i = 0; i < count; i++) {
      if (customGenerator) {
        relationsToInsert.push(customGenerator(i));
      } else {
        relationsToInsert.push({
          filmId: faker.number.int({ min: 1, max: resolvedMaxFilmId ?? 10 }),
          genreId: faker.number.int({ min: 1, max: resolvedMaxGenreId ?? 5 }),
        });
      }
    }

    if (relationsToInsert.length === 0) {
      console.log('No film-genre relations configured to seed. Skipping...');
      return;
    }

    console.log(`Seeding ${relationsToInsert.length} film-genre relations into the database...`);

    const sqlQuery =
      onDuplicate === 'ignore'
        ? `INSERT IGNORE INTO films_genres (film_id, genre_id) VALUES (?, ?);`
        : `INSERT INTO films_genres (film_id, genre_id) 
           VALUES (?, ?) 
           ON DUPLICATE KEY UPDATE 
           genre_id = VALUES(genre_id);`;

    for (let i = 0; i < relationsToInsert.length; i++) {
      const rel = relationsToInsert[i];

      await queryRunner.query(sqlQuery, [rel.filmId, rel.genreId]);

      console.log(
        `Relation [${i + 1}/${relationsToInsert.length}] (Film ID: ${rel.filmId} <-> Genre ID: ${rel.genreId}) processed.`,
      );
    }

    console.log('Films-Genres seeding completed successfully.');
  } catch (error) {
    console.error('Error during films-genres seeding:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}