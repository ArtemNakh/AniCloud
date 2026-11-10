import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from './entities/role.entity.js';
import { Repository } from 'typeorm';
import { IApiResponse } from '../lib/common/api-response.interface.js';

@Injectable()
export class RolesService {
  constructor(@InjectRepository(Role) private roleRepo: Repository<Role>) {}

  async findAll(): Promise<IApiResponse<Role[]>> {
    const roles = await this.roleRepo.find();
    return {
      message: 'Roles fetched',
      data: roles,
    };
  }

  async findById(roleId: number): Promise<IApiResponse<Role>> {
    const role = await this.roleRepo.findOne({ where: { id: roleId } });

    if (role == null) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }
    return {
      message: 'Role fetched',
      data: role,
    };
  }
}
