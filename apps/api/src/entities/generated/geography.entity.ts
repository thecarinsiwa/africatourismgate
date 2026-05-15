import { Entity, Column, PrimaryColumn } from 'typeorm';
import { BaseAuditEntity } from '../../common/entities/base-audit.entity';
@Entity('destinations')
export class Destinations extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'name', length: 180 })
  name!: string;

  @Column({ type: 'varchar', name: 'slug', length: 180 })
  slug!: string;

  @Column({ type: 'varchar', name: 'country_code', length: 2 })
  countryCode!: string;

  @Column({ type: 'text', name: 'description', nullable: true })
  description!: string;

}

@Entity('points_of_interest')
export class PointsOfInterest extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'destination_id', length: 36 })
  destinationId!: string;

  @Column({ type: 'varchar', name: 'name', length: 180 })
  name!: string;

  @Column({ type: 'decimal', name: 'latitude', precision: 10, scale: 7, nullable: true })
  latitude!: string;

  @Column({ type: 'decimal', name: 'longitude', precision: 10, scale: 7, nullable: true })
  longitude!: string;

}