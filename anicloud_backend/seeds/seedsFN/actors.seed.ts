import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';

export interface SeedActorInput {
  name: string;
  surname: string;
  middlename: string;
  birthday: Date | string;
  link_photo?: string | null;
}

export interface SeedActorsOptions {
  /** Number of random actors to generate (defaults to 10 if staticActors are not provided) */
  count?: number;
  /** Array of specific actors that must be created */
  staticActors?: SeedActorInput[];
  /** Behavior on duplicate/conflict (if a unique constraint existed, but for actors we can just insert or use a custom check). Defaults to 'insert' */
  onDuplicate?: 'insert' | 'update';
  /** Fixed seed for faker (for reproducible results) */
  fakerSeed?: number;
  /** Custom actor fields generator */
  customGenerator?: (index: number) => Partial<SeedActorInput>;
}

export async function seedActors(
  dataSource: DataSource,
  options: SeedActorsOptions | number = {},
): Promise<void> {
  // Підтримка зворотньої сумісності, якщо передали просто число: seedActors(ds, 15)
  const config: SeedActorsOptions =
    typeof options === 'number' ? { count: options } : options;

  const {
    staticActors = [],
    count = staticActors.length > 0 ? 0 : 10,
    fakerSeed,
    customGenerator,
  } = config;

  if (fakerSeed !== undefined) {
    faker.seed(fakerSeed);
  }

  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    const actorsToInsert: SeedActorInput[] = [...staticActors];

    // Генеруємо випадкових акторів
    for (let i = 0; i < count; i++) {
      const customData = customGenerator ? customGenerator(i) : {};

      actorsToInsert.push({
        name: customData.name ?? faker.person.firstName(),
        surname: customData.surname ?? faker.person.lastName(),
        middlename: customData.middlename ?? faker.person.middleName(),
        birthday: customData.birthday ?? faker.date.birthdate({ min: 18, max: 70, mode: 'age' }),
        link_photo: customData.link_photo ?? faker.image.avatar(),
      });
    }

    if (actorsToInsert.length === 0) {
      console.log('No actors configured to seed. Skipping...');
      return;
    }

    console.log(`Seeding ${actorsToInsert.length} actors into the database...`);

    const sqlQuery = `INSERT INTO actors (name, surname, middlename, birthday, link_photo) VALUES (?, ?, ?, ?, ?);`;

    for (let i = 0; i < actorsToInsert.length; i++) {
      const actor = actorsToInsert[i];

      // Форматування дати у формат YYYY-MM-DD для MySQL DATE
      const birthdayFormatted =
        actor.birthday instanceof Date
          ? actor.birthday.toISOString().slice(0, 10)
          : actor.birthday;

      await queryRunner.query(sqlQuery, [
        actor.name,
        actor.surname,
        actor.middlename,
        birthdayFormatted,
        actor.link_photo ?? null,
      ]);

      console.log(
        `Actor [${i + 1}/${actorsToInsert.length}] "${actor.name} ${actor.surname}" processed successfully.`,
      );
    }

    console.log('Actors seeding completed successfully.');
  } catch (error) {
    console.error('Error during actors seeding:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}