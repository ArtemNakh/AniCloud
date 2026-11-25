import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from './entities/role.entity.js';
import { EntityManager, Repository } from 'typeorm';
import { IApiResponse } from '../lib/common/api-response.interface.js';
import { IRole, RoleName } from './entities/role.interface.js';
import { User } from '../users/entities/user.entity.js';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role) private roleRepository: Repository<Role>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<IApiResponse<Role[]>> {
    const roles = await this.roleRepository.find();
    return {
      message: 'Roles fetched',
      data: roles,
    };
  }

  async findById(roleId: number): Promise<IApiResponse<Role>> {
    const role = await this.roleRepository.findOne({ where: { id: roleId } });

    if (role == null) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }
    return {
      message: 'Role fetched',
      data: role,
    };
  }

  async assignDefaultRoleToUser(
    userId: number,
    manager?: EntityManager,
  ): Promise<void> {
    const roleRepo = manager
      ? manager.getRepository(Role)
      : this.roleRepository;
    const userRepo = manager
      ? manager.getRepository(User)
      : this.userRepository;

    // 1. Знаходимо дефолтну роль у БД
    const defaultRole = await roleRepo.findOne({
      where: { name: RoleName.USER },
    });

    if (!defaultRole) {
      throw new NotFoundException(
        `Default role "${RoleName.USER}" not found in database`,
      );
    }

    // 2. Дістаємо користувача разом із його ролями
    const user = await userRepo.findOne({
      where: { id: userId },
      relations: { roles: true },
    });

    if (!user) {
      throw new NotFoundException(`User with id "${userId}" not found`);
    }

    // 3. Перевіряємо, чи роль уже призначена
    const alreadyAssigned = user.roles.some(
      (role: IRole) => role.id === defaultRole.id,
    );

    if (alreadyAssigned) {
      return;
    }

    // 4. Додаємо роль у зв'язок та зберігаємо
    user.roles.push(defaultRole);
    await userRepo.save(user);
  }
}
