import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserRole1794159722717 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
           CREATE TABLE IF NOT EXISTS user_role (
            id INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
            role_id INTEGER UNSIGNED NOT NULL,
            user_id INTEGER UNSIGNED NOT NULL,
            PRIMARY KEY(id),

            CONSTRAINT fk_user_role_user 
            FOREIGN KEY (user_id) REFERENCES users(id) 
            ON DELETE CASCADE ON UPDATE CASCADE,

            CONSTRAINT fk_user_role_role 
            FOREIGN KEY (role_id) REFERENCES roles(id) 
            ON DELETE CASCADE ON UPDATE CASCADE
        );  
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS user_role`);
  }
}
