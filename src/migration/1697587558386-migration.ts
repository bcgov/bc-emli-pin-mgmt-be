import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1697587558386 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';
        await queryRunner.query(
            `ALTER TABLE ${schemaName}.access_request RENAME COLUMN first_name TO given_name;`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';
        await queryRunner.query(
            `ALTER TABLE ${schemaName}.access_request RENAME COLUMN given_name TO first_name;`,
        );
    }
}
