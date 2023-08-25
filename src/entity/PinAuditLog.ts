import { Column, Entity, Index } from 'typeorm';

@Index('pin_audit_log_pkey', ['logId'], { unique: true })
@Entity('pin_audit_log')
export class PinAuditLog {
    @Column('uuid', {
        primary: true,
        name: 'log_id',
        default: () => 'uuid_generate_v4()',
    })
    logId: string;

    @Column('character varying', { name: 'pin', nullable: true, length: 8 })
    pin: string;

    @Column('integer', { name: 'pid' })
    pid: number;

    @Column('enum', { name: 'parcel_status', enum: ['A', 'I'] })
    parcelStatus: 'A' | 'I';

    @Column('character varying', { name: 'title_number', length: 11 })
    titleNumber: string;

    @Column('character varying', { name: 'land_title_district', length: 2 })
    landTitleDistrict: string;

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

    @Column('enum', { name: 'title_status', enum: ['R', 'C'] })
    titleStatus: 'R' | 'C';

    @Column('timestamp with time zone', { name: 'expired_at', nullable: true })
    expiredAt: Date | null;

    @Column('enum', {
        name: 'expiration_reason',
        nullable: true,
        enum: ['OP', 'CC', 'OR', 'CO'],
    })
    expirationReason: 'OP' | 'CC' | 'OR' | 'CO' | null;

    @Column('citext', { name: 'sent_to_email', nullable: true })
    sentToEmail: string | null;

    @Column('character varying', {
        name: 'sent_to_phone',
        nullable: true,
        length: 12,
    })
    sentToPhone: string | null;

    @Column('timestamp with time zone', { name: 'pin_created_at' })
    pinCreatedAt: Date;

    @Column('timestamp with time zone', { name: 'updated_at', nullable: true })
    updatedAt: Date | null;

    @Column('character varying', {
        name: 'expired_by_name',
        nullable: true,
        length: 75,
    })
    expiredByName: string | null;

    @Column('character varying', {
        name: 'expired_by_username',
        nullable: true,
        length: 75,
    })
    expiredByUsername: string | null;

    @Column('uuid', { name: 'live_pin_id' })
    livePinId: string;

    @Column('enum', { name: 'action', enum: ['D', 'C', 'R'] })
    action: 'D' | 'C' | 'R';

    @Column('timestamp with time zone', {
        name: 'log_created_at',
        nullable: true,
        default: () => 'now()',
    })
    logCreatedAt: Date | null;
}
