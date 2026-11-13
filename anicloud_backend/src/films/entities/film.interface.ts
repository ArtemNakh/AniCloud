import { IActor } from '../../actors/entities/actor.interface.js';
import { IGenre } from '../../genres/entities/genre.interface.js';

export interface IFilm {
  id: number;
  title: string;
  description: string;
  logoLink?: string;
  trailerLink?: string;
  createdAt: Date;
  updatedAt: Date;

  actors?: IActor[] | undefined;
  genres?: IGenre[] | undefined;
}
