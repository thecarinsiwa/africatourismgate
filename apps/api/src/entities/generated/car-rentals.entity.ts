import { Entity, Column, PrimaryColumn } from 'typeorm';
import { BaseAuditEntity } from '../../common/entities/base-audit.entity';
@Entity('rental_agencies')
export class RentalAgencies extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'name', length: 180 })
  name!: string;

  @Column({ type: 'varchar', name: 'destination_id', length: 36, nullable: true })
  destinationId!: string;

  @Column({ type: 'varchar', name: 'address', length: 255, nullable: true })
  address!: string;

}

@Entity('vehicle_categories')
export class VehicleCategories extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'name', length: 120 })
  name!: string;

  @Column({ type: 'varchar', name: 'example_model', length: 120, nullable: true })
  exampleModel!: string;

}

@Entity('vehicles')
export class Vehicles extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'agency_id', length: 36 })
  agencyId!: string;

  @Column({ type: 'varchar', name: 'category_id', length: 36 })
  categoryId!: string;

  @Column({ type: 'varchar', name: 'license_plate', length: 32, nullable: true })
  licensePlate!: string;

  @Column({ type: 'int', name: 'daily_price_cents' })
  dailyPriceCents!: number;

  @Column({ type: 'varchar', name: 'currency', length: 3 })
  currency!: string;

}

@Entity('vehicle_availability')
export class VehicleAvailability extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'vehicle_id', length: 36 })
  vehicleId!: string;

  @Column({ type: 'datetime', name: 'start_datetime' })
  startDatetime!: Date;

  @Column({ type: 'datetime', name: 'end_datetime' })
  endDatetime!: Date;

  @Column({ name: 'status', enum: ["available","maintenance","rented"] })
  status!: 'available' | 'maintenance' | 'rented';

}