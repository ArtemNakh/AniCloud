import { MigrationInterface, QueryRunner } from 'typeorm';

export class FilmsActors1794162094525 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS films_actors (
            id INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
            film_id INTEGER UNSIGNED NOT NULL,
            actor_id INTEGER UNSIGNED NOT NULL,
            crew_role VARCHAR(255) NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP    
            PRIMARY kEY(id),

            
            CONSTRAINT fk_films_actors_actor 
            FOREIGN KEY (actor_id) REFERENCES users(id) 
            ON DELETE CASCADE ON UPDATE CASCADE,

            CONSTRAINT fk_films_actors_film 
            FOREIGN KEY (film_id) REFERENCES films(id) 
            ON DELETE CASCADE ON UPDATE CASCADE
        );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS films_actors`);
  }
}
