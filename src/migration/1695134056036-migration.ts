import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1695134056036 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.users DROP COLUMN IF EXISTS display_name;`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.users ADD COLUMN IF NOT EXISTS display_name varchar(125) NOT NULL;`,
        );
    }
}
