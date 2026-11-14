import { AppDataSource } from '../configs/DBSource.config.ts';
import { SeedManager } from './SeedManager.ts';
import { TypeOrmAdapter } from './Typeorm.adapter.ts';
import { seedRoles } from './seedsFN/roles.seed.ts';

// docker compose exec backnest npx ts-node seeds/MainSeed.ts
const dbAdapter = new TypeOrmAdapter(AppDataSource);
const seeder = new SeedManager(dbAdapter);

seeder.addSeed('Roles Seeder', seedRoles, ['Admin']);

seeder.execute();
