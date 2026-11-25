import 'reflect-metadata';
import { AppDataSource } from '../configs/DBSource.config';
import { SeedManager } from './SeedManager';
import { seedRoles } from './seeds/roles.seed';
import { TypeOrmAdapter } from './Typeorm.adapter';
// docker compose exec backnest npx ts-node seeds/MainSeed
const dbAdapter = new TypeOrmAdapter(AppDataSource);
const seeder = new SeedManager(dbAdapter);
seeder.addSeed('Roles Seeder', seedRoles);
await seeder.execute();
