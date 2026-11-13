import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RolesModule } from './roles/roles.module.js';
import { UsersModule } from './users/users.module.js';
import { ActorsModule } from './actors/actors.module.js';
import { AppDataSource } from '../configs/DBSource.config.js';
import { GenresModule } from './genres/genres.module.js';
import { FilmsModule } from './films/films.module.js';
import { TokensModule } from './tokens/tokens.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...AppDataSource.options,
      }),
    }),

    RolesModule,
    UsersModule,
    ActorsModule,
    GenresModule,
    FilmsModule,
    TokensModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
