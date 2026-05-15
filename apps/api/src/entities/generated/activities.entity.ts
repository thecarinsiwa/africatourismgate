import { Entity, Column, PrimaryColumn } from 'typeorm';
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
  description!: string;

  @Column({ type: 'int', name: 'duration_minutes', nullable: true })
  durationMinutes!: number;

  @Column({ type: 'int', name: 'price_cents' })
  priceCents!: number;

  @Column({ type: 'varchar', name: 'currency', length: 3 })
  currency!: string;

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