import { IFilm } from '../../films/entities/film.interface.js';

export interface IActor {
  id: number;
  name: string;
  surname: string;
  middlename: string;
  birthday: Date;

  /**Link on photo in cloud storage  */
  linkPhoto?: string;
  createdAt: Date;
  updatedAt: Date;

  films?: IFilm[] | undefined;
}
