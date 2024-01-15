import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1698266994022 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';
        await queryRunner.query(`DELETE FROM ${schemaName}."permission";`);
        await queryRunner.query(`INSERT INTO ${schemaName}."permission" ("permission","role") VALUES
		('USER_ACCESS','SuperAdmin'),
		('VIEW_PIN','SuperAdmin'),
		('PROPERTY_SEARCH','SuperAdmin'),
		('ACCESS_REQUEST','SuperAdmin'),
    ('DASHBOARD', 'SuperAdmin'),
		('USER_ACCESS','Admin'),
		('PROPERTY_SEARCH','Admin'),
		('ACCESS_REQUEST','Admin'),
		('PROPERTY_SEARCH','Standard');`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';
        await queryRunner.query(`DELETE FROM ${schemaName}."permission";`);
    }
}
