import { IFilm } from '../../films/entities/film.interface.js';

export interface IGenre {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;

  films?: IFilm[] | undefined;
}
