import { Entity, Column, PrimaryColumn } from 'typeorm';
import { BaseAuditEntity } from '../../common/entities/base-audit.entity';
@Entity('airlines')
export class Airlines extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'iata_code', length: 2 })
  iataCode!: string;

  @Column({ type: 'varchar', name: 'name', length: 180 })
  name!: string;

}

@Entity('airports')
export class Airports extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'iata_code', length: 3 })
  iataCode!: string;

  @Column({ type: 'varchar', name: 'name', length: 180 })
  name!: string;

  @Column({ type: 'varchar', name: 'city', length: 120 })
  city!: string;

  @Column({ type: 'varchar', name: 'country_code', length: 2 })
  countryCode!: string;

  @Column({ type: 'decimal', name: 'latitude', precision: 10, scale: 7, nullable: true })
  latitude!: string;

  @Column({ type: 'decimal', name: 'longitude', precision: 10, scale: 7, nullable: true })
  longitude!: string;

}

@Entity('flights')
export class Flights extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'airline_id', length: 36 })
  airlineId!: string;

  @Column({ type: 'varchar', name: 'flight_number', length: 20 })
  flightNumber!: string;

  @Column({ type: 'varchar', name: 'departure_airport_id', length: 36 })
  departureAirportId!: string;

  @Column({ type: 'varchar', name: 'arrival_airport_id', length: 36 })
  arrivalAirportId!: string;

  @Column({ type: 'datetime', name: 'departure_time' })
  departureTime!: Date;

  @Column({ type: 'datetime', name: 'arrival_time' })
  arrivalTime!: Date;

  @Column({ type: 'int', name: 'duration_minutes' })
  durationMinutes!: number;

}

@Entity('flight_classes')
export class FlightClasses extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'flight_id', length: 36 })
  flightId!: string;

  @Column({ name: 'class_name', enum: ["economy","premium_economy","business","first"] })
  className!: 'economy' | 'premium_economy' | 'business' | 'first';

  @Column({ type: 'int', name: 'base_price_cents' })
  basePriceCents!: number;

  @Column({ type: 'int', name: 'seats_total' })
  seatsTotal!: number;

}

@Entity('flight_class_availability')
export class FlightClassAvailability extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'flight_class_id', length: 36 })
  flightClassId!: string;

  @Column({ type: 'date', name: 'date' })
  date!: string;

  @Column({ type: 'int', name: 'available_seats' })
  availableSeats!: number;

  @Column({ type: 'int', name: 'price_cents' })
  priceCents!: number;

}