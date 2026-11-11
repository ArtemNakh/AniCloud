import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { RolesModule } from './roles/roles.module.js';
import { UsersModule } from './users/users.module.js';
import { RolesModule } from './roles/roles.module.js';

@Module({
  imports: [RolesModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
