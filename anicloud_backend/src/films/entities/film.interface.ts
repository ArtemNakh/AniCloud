import { IActor } from '../../actors/entities/actor.interface.js';

export interface IFilm {
  id: number;
  title: string;
  description: string;
  logoLink?: string;
  trailerLink?: string;
  createdAt: Date;
  updatedAt: Date;

  actors?: IActor[] | undefined;
}
