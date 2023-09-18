import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1695048094839 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS ${schemaName}."raw_ltsa_data" (
        live_pin_id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
        pin VARCHAR(8),
        pid INT NOT NULL,
        parcel_status ${schemaName}.parcel_status_type NOT NULL,
        title_number VARCHAR(11) NOT NULL,
        land_title_district VARCHAR(2) NOT NULL,
        title_status ${schemaName}.title_status_type NOT NULL,
        from_title_number VARCHAR(11),
        from_land_title_district VARCHAR(2),
        given_name VARCHAR(50),
        last_name_1 VARCHAR(75),
        last_name_2 VARCHAR(75),
        incorporation_number VARCHAR(12),
        address_line_1 VARCHAR(65) NOT NULL,
        address_line_2 VARCHAR(65),
        city VARCHAR(30) NOT NULL,
        province CHAR(2),
        other_geographic_division VARCHAR(24),
        country VARCHAR(38) NOT NULL,
        postal_code VARCHAR(12),
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP
      );`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';
        await queryRunner.query(
            `DROP TABLE IF EXISTS ${schemaName}."raw_ltsa_data"`,
        );
    }
}
