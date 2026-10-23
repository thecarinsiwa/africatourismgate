import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';
import { BaseAuditEntity } from '../../common/entities/base-audit.entity';
@Entity('activity_providers')
export class ActivityProviders extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'destination_id', length: 36 })
  destinationId!: string;

  @Column({ type: 'varchar', name: 'name', length: 180 })
  name!: string;

  @Column({ type: 'varchar', name: 'logo_url', length: 512, nullable: true })
  logoUrl!: string | null;

}

@Entity('activities')
export class Activities extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'provider_id', length: 36 })
  providerId!: string;

  @Column({ type: 'varchar', name: 'title', length: 255 })
  title!: string;

  @Column({ type: 'text', name: 'description', nullable: true })
  description!: string | null;

  @Column({ type: 'int', name: 'duration_minutes', nullable: true })
  durationMinutes!: number | null;

  @Column({ name: 'difficulty_level', enum: ["easy","moderate","hard","expert"], nullable: true })
  difficultyLevel!: 'easy' | 'moderate' | 'hard' | 'expert';

  @Column({ type: 'int', name: 'price_cents' })
  priceCents!: number;

  @Column({ type: 'varchar', name: 'currency', length: 3 })
  currency!: string;

  @Column({ type: 'decimal', name: 'latitude', precision: 10, scale: 7, nullable: true })
  latitude!: string | null;

  @Column({ type: 'decimal', name: 'longitude', precision: 10, scale: 7, nullable: true })
  longitude!: string | null;

  @Column({ type: 'varchar', name: 'organization_id', length: 36, nullable: true })
  organizationId!: string | null;

  @Column({
    type: 'boolean',
    name: 'allow_booking_requests_when_unavailable',
    default: false,
  })
  allowBookingRequestsWhenUnavailable!: boolean;

}

@Entity('activity_booking_requests')
export class ActivityBookingRequests extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'activity_id', length: 36 })
  activityId!: string;

  @Column({ type: 'varchar', name: 'organization_id', length: 36, nullable: true })
  organizationId!: string | null;

  @Column({ type: 'varchar', name: 'full_name', length: 180 })
  fullName!: string;

  @Column({ type: 'varchar', name: 'email', length: 255 })
  email!: string;

  @Column({ type: 'varchar', name: 'phone', length: 40, nullable: true })
  phone!: string | null;

  @Column({ type: 'date', name: 'preferred_date' })
  preferredDate!: string;

  @Column({ type: 'int', name: 'participants', unsigned: true })
  participants!: number;

  @Column({ type: 'text', name: 'message', nullable: true })
  message!: string | null;

  @Column({
    name: 'status',
    enum: ['pending', 'contacted', 'confirmed', 'cancelled'],
    default: 'pending',
  })
  status!: 'pending' | 'contacted' | 'confirmed' | 'cancelled';

}

@Entity('activity_schedules')
export class ActivitySchedules extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'activity_id', length: 36 })
  activityId!: string;

  @Column({ type: 'datetime', name: 'start_datetime' })
  startDatetime!: Date;

  @Column({ type: 'int', name: 'capacity' })
  capacity!: number;

  @Column({ type: 'int', name: 'booked_count' })
  bookedCount!: number;

}

@Entity('activity_description_assets')
export class ActivityDescriptionAssets extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'activity_id', length: 36 })
  activityId!: string;

  @Column({ name: 'asset_type', enum: ["image","pdf","word"] })
  assetType!: 'image' | 'pdf' | 'word';

  @Column({ type: 'varchar', name: 'url', length: 1024 })
  url!: string;

  @Column({ type: 'varchar', name: 'name', length: 255, nullable: true })
  name!: string | null;

  @Column({ type: 'int', name: 'sort_order' })
  sortOrder!: number;

}