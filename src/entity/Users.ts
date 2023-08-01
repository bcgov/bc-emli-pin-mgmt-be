import { Column, Entity, Index } from 'typeorm';

@Index('user_pkey', ['userId'], { unique: true })
@Entity('users', { schema: 'public' })
export class Users {
    @Column('uuid', {
        primary: true,
        name: 'user_id',
        default: () => 'uuid_generate_v4()',
    })
    userId: string;

    @Column('character varying', { name: 'user_guid', length: 36 })
    userGuid: string;

    @Column('character varying', { name: 'identity_type', length: 10 })
    identityType: string;

    @Column('enum', { name: 'role', enum: ['Standard', 'Admin', 'SuperAdmin'] })
    role: 'Standard' | 'Admin' | 'SuperAdmin';

    @Column('character varying', { name: 'organization', length: 50 })
    organization: string;

    @Column('citext', { name: 'email' })
    email: string;

    @Column('character varying', { name: 'user_name', length: 50 })
    userName: string;

    @Column('character varying', { name: 'first_name', length: 50 })
    firstName: string;

    @Column('character varying', { name: 'last_name', length: 75 })
    lastName: string;

    @Column('boolean', { name: 'is_active' })
    isActive: boolean;
}
