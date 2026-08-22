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

  @Column({ type: 'datetime', name: 'start_datetime' })
  startDatetime!: Date;

  @Column({ type: 'datetime', name: 'end_datetime' })
  endDatetime!: Date;

  @Column({ type: 'varchar', name: 'notes', length: 500, nullable: true })
  notes!: string | null;

  @CreateDateColumn({ name: 'assigned_at', type: 'timestamp' })
  assignedAt!: Date;

  @Column({ type: 'varchar', name: 'assigned_by_user_id', length: 36, nullable: true })
  assignedByUserId!: string | null;
}

@Entity('guide_availability')
export class GuideAvailability extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'guide_id', length: 36 })
  guideId!: string;

  @Column({ type: 'datetime', name: 'start_datetime' })
  startDatetime!: Date;

  @Column({ type: 'datetime', name: 'end_datetime' })
  endDatetime!: Date;

  @Column({ name: 'status', enum: ['available', 'unavailable'], default: 'unavailable' })
  status!: 'available' | 'unavailable';
}

@Entity('booking_guide_assignment_history')
export class BookingGuideAssignmentHistory {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'assignment_id', length: 36 })
  assignmentId!: string;

  @Column({ type: 'varchar', name: 'booking_id', length: 36 })
  bookingId!: string;

  @Column({ type: 'varchar', name: 'guide_id', length: 36 })
  guideId!: string;

  @Column({ name: 'action', enum: ['created', 'updated', 'deleted'] })
  action!: 'created' | 'updated' | 'deleted';

  @Column({ type: 'json', name: 'snapshot' })
  snapshot!: Record<string, unknown>;

  @Column({ type: 'varchar', name: 'actor_user_id', length: 36, nullable: true })
  actorUserId!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;
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
