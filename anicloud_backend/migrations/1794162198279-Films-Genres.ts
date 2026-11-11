import { MigrationInterface, QueryRunner } from 'typeorm';

export class FilmsGenres1794162198279 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS films_genres (
                id INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
                film_id INTEGER UNSIGNED NOT NULL,
                genre_id INTEGER UNSIGNED NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY(id),

                CONSTRAINT fk_films_genres_film 
                FOREIGN KEY (film_id) REFERENCES films(id) 
                ON DELETE CASCADE ON UPDATE CASCADE,


                CONSTRAINT fk_films_genres_genre
                FOREIGN KEY (genre_id) REFERENCES genres(id) 
                ON DELETE CASCADE ON UPDATE CASCADE

            );
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS films_genres`);
  }
}
