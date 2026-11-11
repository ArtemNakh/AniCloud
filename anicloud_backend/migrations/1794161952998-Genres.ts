import { MigrationInterface, QueryRunner } from 'typeorm';

export class Genres1794161952998 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS genres (
            id INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
            name VARCHAR(255) NOT NULL UNIQUE,
            description VARCHAR(255) NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,  
            PRIMARY KEY(id)
        );
    `);
 
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS genres`);
  }
}
