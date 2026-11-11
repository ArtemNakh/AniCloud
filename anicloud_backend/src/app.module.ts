import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { RolesModule } from './roles/roles.module.js';
import { ActorsModule } from './actors/actors.module.js';
import { UsersModule } from './users/users.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataSource } from '../configs/DBSource.config.js';

@Module({
  imports: [
    
    TypeOrmModule.forRoot({
      ...AppDataSource.options,
    }),
    RolesModule,
    UsersModule,
    ActorsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
