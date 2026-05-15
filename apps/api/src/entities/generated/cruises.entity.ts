import { Entity, Column, PrimaryColumn } from 'typeorm';
import { BaseAuditEntity } from '../../common/entities/base-audit.entity';
@Entity('cruise_lines')
export class CruiseLines extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'name', length: 180 })
  name!: string;

}

@Entity('cruise_ports')
export class CruisePorts extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'code', length: 16 })
  code!: string;

  @Column({ type: 'varchar', name: 'name', length: 180 })
  name!: string;

  @Column({ type: 'varchar', name: 'country_code', length: 2 })
  countryCode!: string;

}

@Entity('ships')
export class Ships extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'cruise_line_id', length: 36 })
  cruiseLineId!: string;

  @Column({ type: 'varchar', name: 'name', length: 180 })
  name!: string;

  @Column({ type: 'int', name: 'built_year', nullable: true })
  builtYear!: number;

}

@Entity('itineraries')
export class Itineraries extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'ship_id', length: 36 })
  shipId!: string;

  @Column({ type: 'varchar', name: 'name', length: 180 })
  name!: string;

  @Column({ type: 'int', name: 'duration_nights' })
  durationNights!: number;

}

@Entity('itinerary_ports')
export class ItineraryPorts extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'itinerary_id', length: 36 })
  itineraryId!: string;

  @Column({ type: 'varchar', name: 'port_id', length: 36 })
  portId!: string;

  @Column({ type: 'int', name: 'day_number' })
  dayNumber!: number;

  @Column({ type: 'time', name: 'arrival_time', nullable: true })
  arrivalTime!: string;

  @Column({ type: 'time', name: 'departure_time', nullable: true })
  departureTime!: string;

}

@Entity('cabins')
export class Cabins extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'ship_id', length: 36 })
  shipId!: string;

  @Column({ type: 'varchar', name: 'category_name', length: 80 })
  categoryName!: string;

  @Column({ type: 'int', name: 'max_guests' })
  maxGuests!: number;

  @Column({ type: 'int', name: 'base_price_cents' })
  basePriceCents!: number;

  @Column({ type: 'varchar', name: 'currency', length: 3 })
  currency!: string;

}

@Entity('cruise_sailings')
export class CruiseSailings extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'itinerary_id', length: 36 })
  itineraryId!: string;

  @Column({ type: 'date', name: 'departure_date' })
  departureDate!: string;

}

@Entity('cabin_availability')
export class CabinAvailability extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'cabin_id', length: 36 })
  cabinId!: string;

  @Column({ type: 'varchar', name: 'sailing_id', length: 36 })
  sailingId!: string;

  @Column({ type: 'int', name: 'available_count' })
  availableCount!: number;

  @Column({ type: 'int', name: 'price_cents' })
  priceCents!: number;

}