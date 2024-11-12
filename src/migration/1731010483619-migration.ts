import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1731010483619 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';

        await queryRunner.query(
            `ALTER TABLE ${schemaName}.active_pin ADD bcsc_id varchar(50) NULL;`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';

        await queryRunner.query(
            `ALTER TABLE ${schemaName}.active_pin ADD bcsc_id varchar(50) NULL;`,
        );
    }
}
