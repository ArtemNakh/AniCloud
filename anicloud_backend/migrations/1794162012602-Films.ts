import { MigrationInterface, QueryRunner } from 'typeorm';

export class Films1794162012602 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS films (
            id INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
            title VARCHAR(255) NOT NULL,
            description VARCHAR(255) NOT NULL,
            logoLink VARCHAR(255) NULL DEFAULT NULL,
            trailer_link VARCHAR(255) NULL DEFAULT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,  
            PRIMARY KEY(id)
        );
    `);

  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS films`);
  }
}
