import { AppDataSource } from '../configs/DBSource.config.ts';
import { SeedManager } from './SeedManager.ts';
import { TypeOrmAdapter } from './Typeorm.adapter.ts';
import { seedActors } from './seedsFN/actors.seed.ts';
import { seedFilmsActors } from './seedsFN/films-actors.seed.ts';
import { seedFilmsGenres } from './seedsFN/films-genres.seed.ts';
import { seedFilms } from './seedsFN/films.seed.ts';
import { seedGenres } from './seedsFN/genres.seed.ts';
import { seedRoles } from './seedsFN/roles.seed.ts';
import { seedUserRoles } from './seedsFN/user-role.seed.ts';
import { seedUsers } from './seedsFN/users.seed.ts';

// docker compose exec backnest npx ts-node seeds/MainSeed.ts
const dbAdapter = new TypeOrmAdapter(AppDataSource);
const seeder = new SeedManager(dbAdapter);

seeder.addSeed('Roles Seeder', seedRoles, [
  'ADMIN_CONTENT',
  'ADMIN_CHAT',
  'ADMIN_USER',
]);

// Users---------------------------------------------------------------
// --- ОБЕРІТЬ ОДИН ІЗ ВАРІАНТІВ ВИКЛИКУ ДЛЯ USERS ---

// Варіант 1: Базовий (згенерує 10 випадкових користувачів за замовчуванням)
// seeder.addSeed('Users Seeder (Default)', seedUsers, {
//   defaultPassword: `Password123!`,
//   count: 50,
// });

// // Варіант 2: Передати просто кількість (як було раніше)
seeder.addSeed('Users Seeder (Count only)', seedUsers, 25);

// // Варіант 3: Комбінований (створити тестового адміна + 15 випадкових юзерів зі спільним паролем)
// seeder.addSeed('Users Seeder (Dev setup)', seedUsers, {
//   staticUsers: [
//     {
//       username: 'superadmin',
//       email: 'admin@anicloud.com',
//       password: 'admin123_hashed',
//     },
//     {
//       username: 'moderator',
//       email: 'mod@anicloud.com',
//       password: 'mod123_hashed',
//     },
//   ],
//   count: 15,
//   defaultPassword: 'Password123!',
//   onDuplicate: 'ignore', // Не перезаписувати існуючих користувачів
// });

// // Варіант 4: Відтворювана генерація з кастомним форматом та хешуванням
// seeder.addSeed('Users Seeder (Deterministic)', seedUsers, {
//   count: 5,
//   fakerSeed: 42, // Завжди генеруватиме тих самих 5 юзерів
//   defaultPassword: 'SecretPassword',
//   // hashPasswordFn: (pwd) => bcrypt.hashSync(pwd, 10),
//   customGenerator: (index: number) => ({
//     email: `test_user_${index + 1}@anicloud.local`,
//   }),
// });

//actors -----------------------------------------------------------------
// seeder.addSeed('Actors Default', seedActors);
seeder.addSeed('Actors Count', seedActors, 25); // Згенерує 25 акторів
// seeder.addSeed('Actors Static', seedActors, {
//   staticActors: [
//     {
//       name: 'Keanu',
//       surname: 'Reeves',
//       middlename: 'Charles',
//       birthday: '1964-09-02',
//       link_photo: 'https://example.com/keanu.jpg',
//     },
//     {
//       name: 'Scarlett',
//       surname: 'Johansson',
//       middlename: 'Ingrid',
//       birthday: '1984-11-22',
//       link_photo: null, // Можна передавати null, якщо фото немає
//     },
//   ],
// });
// seeder.addSeed('Actors Mixed', seedActors, {
//   staticActors: [
//     {
//       name: 'Admin',
//       surname: 'Actor',
//       middlename: 'Test',
//       birthday: '2000-01-01',
//     },
//   ],
//   count: 10, // Додасть ще 10 випадкових акторів до статичного
// });
// seeder.addSeed('Actors Deterministic', seedActors, {
//   count: 8,
//   fakerSeed: 42, // Фіксований seed гарантує однаковий результат щоразу
// });
// seeder.addSeed('Actors Custom Generator', seedActors, {
//   count: 5,
//   customGenerator: (index: number) => ({
//     name: `ActorName_${index + 1}`,
//     surname: `ActorSurname_${index + 1}`,
//     link_photo: `https://example.com/photos/actor_${index + 1}.jpg`,
//   }),
// });

// / --- ВАРІАНТИ ВИКЛИКУ ДЛЯ ЗВ'ЯЗКІВ (USER_ROLE) ----------------------------------------------------

// Варіант 1: Автоматична генерація 15 випадкових зв'язків (автоматично визначить межі ID з баз users та roles)
seeder.addSeed('UserRoles Default', seedUserRoles, 15);

// // Варіант 2: Статичні зв'язки (наприклад, жорстко прив'язати користувача з ID = 1 до ролі ID = 1 [Admin])
// seeder.addSeed('UserRoles Static', seedUserRoles, {
//   staticRelations: [
//     { userId: 1, roleId: 1 }, // Admin user
//     { userId: 1, roleId: 2 }, // User role for same admin
//     { userId: 2, roleId: 2 }, // Regular user
//   ],
//   onDuplicate: 'ignore',
// });

// // Варіант 3: Детермінована генерація через fakerSeed з кастомною логікою
// seeder.addSeed('UserRoles Custom Generator', seedUserRoles, {
//   count: 5,
//   fakerSeed: 42,
//   customGenerator: (index: number) => ({
//     userId: index + 1, // Прив'язуємо по черзі користувачів з ID 1, 2, 3, 4, 5
//     roleId: 2, // Всім їм даємо роль ID = 2 (наприклад, "User")
//   }),
// });

// ---------------------------------------------------------------------------------
// --- ВАРІАНТИ ВИКЛИКУ ДЛЯ GENRES ---

// Варіант 1: Базовий (згенерує 10 випадкових жанрів)
// seeder.addSeed('Genres Default', seedGenres, {});

// Варіант 2: Передати просто число (кількість)
seeder.addSeed('Genres Count', seedGenres, 8);

// // Варіант 3: Статичні жанри (обов'язкові базові жанри для аніме/фільмів)
// seeder.addSeed('Genres Static', seedGenres, {
//   staticGenres: [
//     {
//       name: 'Action',
//       description: 'Fast-paced shows with lots of fights and physical feats.',
//     },
//     {
//       name: 'Drama',
//       description: 'Focuses on emotional themes and character development.',
//     },
//     {
//       name: 'Comedy',
//       description: 'Light-hearted shows designed to make the audience laugh.',
//     },
//   ],
//   onDuplicate: 'ignore', // Пропускати, якщо такий жанр вже є
// });

// // Варіант 4: Детермінована генерація з кастомним генератором
// seeder.addSeed('Genres Custom', seedGenres, {
//   count: 5,
//   fakerSeed: 99,
//   customGenerator: (index: number) => ({
//     name: `CustomGenre_${index + 1}`,
//   }),
// });

// films ---------------------------------------------

// Варіант 1: Базовий (згенерує 10 випадкових фільмів)
// seeder.addSeed('Films Default', seedFilms, {});

// Варіант 2: Передати просто число (кількість)
seeder.addSeed('Films Count', seedFilms, 5);

// // Варіант 3: Статичні фільми (реальні або тестові дані)
// seeder.addSeed('Films Static', seedFilms, {
//   staticFilms: [
//     {
//       title: 'AniCloud Origin',
//       description: 'The first official release story of the platform.',
//       logoLink: 'https://example.com/logo1.png',
//       trailer_link: 'https://youtube.com/watch?v=example1',
//     },
//   ],
// });

// // Варіант 4: Детермінована генерація з кастомним генератором
// seeder.addSeed('Films Custom', seedFilms, {
//   count: 3,
//   fakerSeed: 777,
//   customGenerator: (index: number) => ({
//     title: `Anime Movie Vol. ${index + 1}`,
//   }),
// });

// films-actors-------------------------------------------------
// --- ВАРІАНТИ ВИКЛИКУ ДЛЯ FILMS_ACTORS ---

// Варіант 1: Автоматична генерація 15 випадкових зв'язків (автоматично визначить межі ID фільмів і акторів)
seeder.addSeed('FilmsActors Default', seedFilmsActors, 15);

// // Варіант 2: Статичні зв'язки (прив'язка конкретних акторів до конкретних фільмів із ролями)
// seeder.addSeed('FilmsActors Static', seedFilmsActors, {
//   staticRelations: [
//     { filmId: 1, actorId: 1, crewRole: 'Main Hero' },
//     { filmId: 1, actorId: 2, crewRole: 'Villain' },
//     { filmId: 2, actorId: 1, crewRole: 'Supporting Role' },
//   ],
//   onDuplicate: 'ignore',
// });

// // Варіант 3: Детермінована генерація через fakerSeed з кастомною логікою
// seeder.addSeed('FilmsActors Custom', seedFilmsActors, {
//   count: 5,
//   fakerSeed: 333,
//   customGenerator: (index: number) => ({
//     filmId: 1, // Прив'язуємо всіх до фільму з ID = 1
//     actorId: index + 1, // По черзі додаємо акторів 1, 2, 3, 4, 5
//     crewType: 'Background Cast',
//   } as any),
// });

// films-genres ------------------------------------------------
// Варіант 1: Автоматична генерація 15 випадкових зв'язків (автоматично визначить межі ID фільмів і жанрів)
seeder.addSeed('FilmsGenres Default', seedFilmsGenres, 15);

//// Варіант 2: Статичні зв'язки (прив'язка конкретних жанрів до фільмів)
// seeder.addSeed('FilmsGenres Static', seedFilmsGenres, {
//   staticRelations: [
//     { filmId: 1, genreId: 1 }, // Фільм 1 -> Жанр 1
//     { filmId: 1, genreId: 2 }, // Фільм 1 -> Жанр 2 (у фільма може бути кілька жанрів)
//     { filmId: 2, genreId: 3 }, // Фільм 2 -> Жанр 3
//   ],
//   onDuplicate: 'ignore',
// });

// // Варіант 3: Детермінована генерація через fakerSeed з кастомною логікою
// seeder.addSeed('FilmsGenres Custom', seedFilmsGenres, {
//   count: 5,
//   fakerSeed: 555,
//   customGenerator: (index: number) => ({
//     filmId: index + 1, // По черзі зв'язуємо фільми з ID 1, 2, 3, 4, 5
//     genreId: 1,        // Надаємо всім їм загальний жанр з ID = 1
//   }),
// });

seeder.execute();
