import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1697251884464 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.users RENAME COLUMN username TO user_name;`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.users RENAME COLUMN user_name TO username;`,
        );
    }
}
