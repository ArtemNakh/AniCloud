import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IFilm } from './film.interface.js';
import { Actor } from '../../actors/entities/actor.entity.js';
import { IActor } from '../../actors/entities/actor.interface.js';
import { IGenre } from '../../genres/entities/genre.interface.js';
import { Genre } from '../../genres/entities/genre.entity.js';

@Entity('films')
export class Film implements IFilm {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  description: string;

  @Column({ nullable: true, default: null })
  logoLink?: string | undefined;

  @Column({ nullable: true, default: null })
  trailerLink?: string | undefined;

  @ManyToMany(() => Actor, (actor) => actor.films, { cascade: true })
  @JoinTable({
    name: 'films_actors',
    joinColumn: { name: 'film_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'actor_id', referencedColumnName: 'id' },
  })
  actors?: IActor[] | undefined;

  @ManyToMany(() => Genre, (genre) => genre.films, { cascade: true })
  @JoinTable({
    name: 'films_genres',
    joinColumn: { name: 'film_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'genre_id', referencedColumnName: 'id' },
  })
  genres?: IGenre[] | undefined;

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
