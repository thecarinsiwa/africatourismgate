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

  @Column({ type: 'varchar', name: 'organization_id', length: 36, nullable: true })
  organizationId!: string | null;

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