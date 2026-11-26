import { DataSource } from 'typeorm';
import 'dotenv/config';

const useSrc = process.env.ENTITY_SOURCE === 'src';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: useSrc ? ['src/**/*.entity.ts'] : ['dist/**/*.entity.js'],
  // entities: ['dist/**/*.entity.js'],
  // entities: [ 'dist/**/*.entity.js','src/**/*.entity.ts'],
  migrations: ['migrations/*{.ts,.js}'],
  synchronize: false,
  logging: true,
});
