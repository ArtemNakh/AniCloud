import { AppDataSource } from '../configs/DBSource.config.ts';
import { SeedManager } from './SeedManager.ts';
import { TypeOrmAdapter } from './Typeorm.adapter.ts';
import { seedRoles } from './seedsFN/roles.seed.ts';
import { seedUsers } from './seedsFN/users.seed.ts';

// docker compose exec backnest npx ts-node seeds/MainSeed.ts
const dbAdapter = new TypeOrmAdapter(AppDataSource);
const seeder = new SeedManager(dbAdapter);

seeder.addSeed('Roles Seeder', seedRoles, ['Admin']);

// Users
// --- ОБЕРІТЬ ОДИН ІЗ ВАРІАНТІВ ВИКЛИКУ ДЛЯ USERS ---

// Варіант 1: Базовий (згенерує 10 випадкових користувачів за замовчуванням)
seeder.addSeed('Users Seeder (Default)', seedUsers, {
  defaultPassword: `Password123!`,
  count: 50,
});

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

seeder.execute();
