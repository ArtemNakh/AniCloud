import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';

export interface SeedFilmActorInput {
  filmId: number;
  actorId: number;
  crewRole: string;
}

export interface SeedFilmsActorsOptions {
  /** Number of random film-actor relations to generate (defaults to 10 if staticRelations are not provided) */
  count?: number;
  /** Array of specific relations that must be created */
  staticRelations?: SeedFilmActorInput[];
  /** Maximum film ID for generating random relations (if not specified, auto-fetched from database) */
  maxFilmId?: number;
  /** Maximum actor ID for generating random relations (if not specified, auto-fetched from database) */
  maxActorId?: number;
  /** Behavior on duplicate/conflict: 'ignore' (skip) or 'update' (update role) */
  onDuplicate?: 'ignore' | 'update';
  /** Fixed seed for faker (for reproducible results) */
  fakerSeed?: number;
  /** Custom relation fields generator */
  customGenerator?: (index: number) => SeedFilmActorInput;
}

export async function seedFilmsActors(
  dataSource: DataSource,
  options: SeedFilmsActorsOptions | number = {},
): Promise<void> {
  // Підтримка зворотньої сумісності, якщо передали просто число (кількість зв'язків)
  const config: SeedFilmsActorsOptions =
    typeof options === 'number' ? { count: options } : options;

  const {
    staticRelations = [],
    count = staticRelations.length > 0 ? 0 : 10,
    maxFilmId,
    maxActorId,
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
    let resolvedMaxActorId = maxActorId;

    // Якщо максимальні ID не передані, динамічно запитуємо їх з бази
    if ((!resolvedMaxFilmId || !resolvedMaxActorId) && count > 0) {
      const filmRes = await queryRunner.query(`SELECT MAX(id) as maxId FROM films;`);
      // Увага: якщо у вас актори в таблиці actors, замініть нижче 'users' на 'actors'
      const actorRes = await queryRunner.query(`SELECT MAX(id) as maxId FROM actors;`);

      resolvedMaxFilmId = resolvedMaxFilmId ?? (filmRes[0]?.maxId || 1);
      resolvedMaxActorId = resolvedMaxActorId ?? (actorRes[0]?.maxId || 1);
    }

    const relationsToInsert: SeedFilmActorInput[] = [...staticRelations];

    // Список типових ролей у знімальній групі/фільмі для генерації
    const defaultRoles = ['Lead Actor', 'Supporting Actor', 'Cameo', 'Voice Actor', 'Antagonist'];

    // Генеруємо випадкові зв'язки
    for (let i = 0; i < count; i++) {
      if (customGenerator) {
        relationsToInsert.push(customGenerator(i));
      } else {
        relationsToInsert.push({
          filmId: faker.number.int({ min: 1, max: resolvedMaxFilmId ?? 10 }),
          actorId: faker.number.int({ min: 1, max: resolvedMaxActorId ?? 10 }),
          crewRole: faker.helpers.arrayElement(defaultRoles),
        });
      }
    }

    if (relationsToInsert.length === 0) {
      console.log('No film-actor relations configured to seed. Skipping...');
      return;
    }

    console.log(`Seeding ${relationsToInsert.length} film-actor relations into the database...`);

    const sqlQuery =
      onDuplicate === 'ignore'
        ? `INSERT IGNORE INTO films_actors (film_id, actor_id, crew_role) VALUES (?, ?, ?);`
        : `INSERT INTO films_actors (film_id, actor_id, crew_role) 
           VALUES (?, ?, ?) 
           ON DUPLICATE KEY UPDATE 
           crew_role = VALUES(crew_role);`;

    for (let i = 0; i < relationsToInsert.length; i++) {
      const rel = relationsToInsert[i];

      await queryRunner.query(sqlQuery, [rel.filmId, rel.actorId, rel.crewRole]);

      console.log(
        `Relation [${i + 1}/${relationsToInsert.length}] (Film ID: ${rel.filmId} <-> Actor ID: ${rel.actorId}, Role: ${rel.crewRole}) processed.`,
      );
    }

    console.log('Films-Actors seeding completed successfully.');
  } catch (error) {
    console.error('Error during films-actors seeding:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}