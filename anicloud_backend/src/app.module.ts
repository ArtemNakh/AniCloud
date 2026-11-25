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
import { PermissionsModule } from './permissions/permissions.module.js';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfigAsync } from '../configs/JWTModule.config.js';
import { AuthModule } from './auth/auth.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    JwtModule.registerAsync(jwtConfigAsync),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => ({
        ...AppDataSource.options,
      }),
    }),

    RolesModule,
    UsersModule,
    ActorsModule,
    GenresModule,
    FilmsModule,
    TokensModule,
    PermissionsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
