import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseAuditEntity } from '../common/entities/base-audit.entity';

export type TeamMemberStatus = 'draft' | 'published';

@Entity('team_members')
export class TeamMembers extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'name', length: 120 })
  name!: string;

  @Column({ type: 'varchar', name: 'role', length: 160 })
  role!: string;

  @Column({ type: 'text', name: 'bio', nullable: true })
  bio!: string | null;

  @Column({ type: 'varchar', name: 'photo_url', length: 512, nullable: true })
  photoUrl!: string | null;

  @Column({ type: 'int', name: 'sort_order', default: 0 })
  sortOrder!: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['draft', 'published'],
    default: 'draft',
  })
  status!: TeamMemberStatus;

  @Column({ type: 'varchar', name: 'locale', length: 5, default: 'fr' })
  locale!: string;
}
