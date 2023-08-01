import { Column, Entity, Index } from 'typeorm';

@Index('active_pin_pkey', ['livePinId'], { unique: true })
@Entity('active_pin', { schema: 'public' })
export class ActivePin {
    @Column('uuid', {
        primary: true,
        name: 'live_pin_id',
        default: () => 'uuid_generate_v4()',
    })
    livePinId: string;

    @Column('character varying', { name: 'pin', nullable: true, length: 8 })
    pin: string | null;

    @Column('integer', { name: 'pid' })
    pid: number;

    @Column('enum', { name: 'parcel_status', enum: ['A', 'I'] })
    parcelStatus: 'A' | 'I';

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

    @Column('character varying', { name: 'address_line_1', length: 65 })
    addressLine_1: string;

    @Column('character varying', {
        name: 'address_line_2',
        nullable: true,
        length: 65,
    })
    addressLine_2: string | null;

    @Column('character varying', { name: 'city', length: 30 })
    city: string;

    @Column('character', { name: 'province', nullable: true, length: 2 })
    province: string | null;

    @Column('character varying', {
        name: 'other_geographic_division',
        nullable: true,
        length: 24,
    })
    otherGeographicDivision: string | null;

    @Column('character varying', { name: 'country', length: 38 })
    country: string;

    @Column('character varying', {
        name: 'postal_code',
        nullable: true,
        length: 12,
    })
    postalCode: string | null;

    @Column('timestamp without time zone', { name: 'created_at' })
    createdAt: Date;

    @Column('timestamp without time zone', {
        name: 'updated_at',
        nullable: true,
    })
    updatedAt: Date | null;
}
