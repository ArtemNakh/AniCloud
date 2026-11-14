import { AppDataSource } from '../configs/DBSource.config.ts';
import { SeedManager } from './SeedManager.ts';
import { TypeOrmAdapter } from './Typeorm.adapter.ts';
import { seedActors } from './seedsFN/actors.seed.ts';
import { seedRoles } from './seedsFN/roles.seed.ts';
import { seedUsers } from './seedsFN/users.seed.ts';

// docker compose exec backnest npx ts-node seeds/MainSeed.ts
const dbAdapter = new TypeOrmAdapter(AppDataSource);
const seeder = new SeedManager(dbAdapter);

// seeder.addSeed('Roles Seeder', seedRoles, ['Admin']);

// Users
// --- ОБЕРІТЬ ОДИН ІЗ ВАРІАНТІВ ВИКЛИКУ ДЛЯ USERS ---

// Варіант 1: Базовий (згенерує 10 випадкових користувачів за замовчуванням)
// seeder.addSeed('Users Seeder (Default)', seedUsers, {
//   defaultPassword: `Password123!`,
//   count: 50,
// });

// // Варіант 2: Передати просто кількість (як було раніше)
// seeder.addSeed('Users Seeder (Count only)', seedUsers, 25);

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




//actors
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





seeder.execute();
