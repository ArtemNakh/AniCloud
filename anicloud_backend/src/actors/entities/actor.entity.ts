import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IActor } from './actor.interface.js';
import { Film } from '../../films/entities/film.entity.js';
import { IFilm } from '../../films/entities/film.interface.js';
@Entity('actors')
export class Actor implements IActor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  surname: string;

  @Column({ nullable: false })
  middlename: string;

  @Column({ nullable: false })
  birthday: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  linkPhoto?: string | undefined;

  @ManyToMany(() => Film, (film) => film.actors)
  films?: IFilm[] | undefined;

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
