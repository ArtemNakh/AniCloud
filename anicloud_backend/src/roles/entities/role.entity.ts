import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IRole } from './role.interface.js';
import { User } from '../../users/entities/user.entity.js';
import { IUser } from '../../users/entities/user.interface.js';
import { Permission } from '../../permissions/entities/permission.entity.js';
import { IPermission } from '../../permissions/entities/permission.interface.js';

@Entity('roles')
export class Role implements IRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, unique: true })
  name: string;

  @ManyToMany(() => User, (user) => user.roles)
  users: IUser[] | undefined;

  @ManyToMany(() => Permission, (permission) =>permission.roles, { cascade: true })
  @JoinTable({
    name: 'roles_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions?: IPermission[] | undefined;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
