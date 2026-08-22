import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';
import { BaseAuditEntity } from '../../common/entities/base-audit.entity';

@Entity('tour_guides')
export class TourGuides extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ name: 'type', enum: ['internal', 'external'] })
  type!: 'internal' | 'external';

  @Column({ type: 'varchar', name: 'user_id', length: 36, nullable: true })
  userId!: string | null;

  @Column({ type: 'varchar', name: 'organization_id', length: 36, nullable: true })
  organizationId!: string | null;

  @Column({ type: 'varchar', name: 'display_name', length: 180 })
  displayName!: string;

  @Column({ type: 'text', name: 'bio', nullable: true })
  bio!: string | null;

  @Column({ type: 'varchar', name: 'photo_url', length: 512, nullable: true })
  photoUrl!: string | null;

  @Column({ type: 'varchar', name: 'contact_email', length: 255, nullable: true })
  contactEmail!: string | null;

  @Column({ type: 'json', name: 'languages' })
  languages!: string[];

  @Column({ type: 'json', name: 'destinations' })
  destinations!: string[];

  @Column({ name: 'status', enum: ['active', 'inactive'], default: 'active' })
  status!: 'active' | 'inactive';
}

@Entity('booking_guide_assignments')
export class BookingGuideAssignments {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'booking_id', length: 36 })
  bookingId!: string;

  @Column({ type: 'varchar', name: 'guide_id', length: 36 })
  guideId!: string;

  @Column({ name: 'role', enum: ['primary', 'secondary'], default: 'primary' })
  role!: 'primary' | 'secondary';

  @CreateDateColumn({ name: 'assigned_at', type: 'timestamp' })
  assignedAt!: Date;

  @Column({ type: 'varchar', name: 'assigned_by_user_id', length: 36, nullable: true })
  assignedByUserId!: string | null;
}

@Entity('booking_messages')
export class BookingMessages extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'booking_id', length: 36 })
  bookingId!: string;

  @Column({ type: 'varchar', name: 'user_id', length: 36, nullable: true })
  userId!: string | null;

  @Column({ type: 'text', name: 'body' })
  body!: string;

  @Column({ type: 'int', name: 'is_staff' })
  isStaff!: number;
}
