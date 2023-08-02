import { Column, Entity, Index } from 'typeorm';

@Index('permission_pkey', ['permissionId'], { unique: true })
@Entity('permission')
export class Permission {
    @Column('uuid', {
        primary: true,
        name: 'permission_id',
        default: () => 'uuid_generate_v4()',
    })
    permissionId: string;

    @Column('character varying', { name: 'permission', length: 50 })
    permission: string;

    @Column('enum', { name: 'role', enum: ['Standard', 'Admin', 'SuperAdmin'] })
    role: 'Standard' | 'Admin' | 'SuperAdmin';
}
