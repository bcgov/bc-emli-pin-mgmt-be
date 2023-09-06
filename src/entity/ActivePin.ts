import { Column, Entity, Index } from 'typeorm';

@Index('active_pin_pkey', ['livePinId'], { unique: true })
@Entity('active_pin')
export class ActivePin {
    @Column('uuid', {
        primary: true,
        name: 'live_pin_id',
        default: () => 'uuid_generate_v4()',
    })
    livePinId: string;

    @Column('character varying', { name: 'pin', nullable: true, length: 8 })
    pin: string | null;

    @Column('character varying', { name: 'pids', length: 500 })
    pids: string;

    @Column('character varying', { name: 'title_number', length: 11 })
    titleNumber: string;

    @Column('character varying', { name: 'land_title_district', length: 2 })
    landTitleDistrict: string;

    @Column('enum', { name: 'title_status', enum: ['R', 'C'] })
    titleStatus: 'R' | 'C';

    @Column('character varying', {
        name: 'from_title_number',
        nullable: true,
        length: 11,
    })
    fromTitleNumber: string | null;

    @Column('character varying', {
        name: 'from_land_title_district',
        nullable: true,
        length: 2,
    })
    fromLandTitleDistrict: string | null;

    @Column('character varying', {
        name: 'given_name',
        nullable: true,
        length: 50,
    })
    givenName: string | null;

    @Column('character varying', {
        name: 'last_name_1',
        nullable: true,
        length: 75,
    })
    lastName_1: string | null;

    @Column('character varying', {
        name: 'last_name_2',
        nullable: true,
        length: 75,
    })
    lastName_2: string | null;

    @Column('character varying', {
        name: 'incorporation_number',
        nullable: true,
        length: 12,
    })
    incorporationNumber: string | null;

    @Column('character varying', {
        name: 'address_line_1',
        nullable: true,
        length: 65,
    })
    addressLine_1: string | null;

    @Column('character varying', {
        name: 'address_line_2',
        nullable: true,
        length: 65,
    })
    addressLine_2: string | null;

    @Column('character varying', { name: 'city', nullable: true, length: 30 })
    city: string | null;

    @Column('character', {
        name: 'province_abbreviation',
        nullable: true,
        length: 2,
    })
    provinceAbbreviation: string | null;

    @Column('character varying', {
        name: 'province_long',
        nullable: true,
        length: 24,
    })
    provinceLong: string | null;

    @Column('character varying', {
        name: 'country',
        nullable: true,
        length: 38,
    })
    country: string | null;

    @Column('character varying', {
        name: 'postal_code',
        nullable: true,
        length: 12,
    })
    postalCode: string | null;

    @Column('timestamp with time zone', {
        name: 'created_at',
        default: () => 'now()',
    })
    createdAt: Date;

    @Column('timestamp with time zone', { name: 'updated_at', nullable: true })
    updatedAt: Date | null;
}
