import { Entity, Column, PrimaryColumn } from 'typeorm';
import { BaseAuditEntity } from '../../common/entities/base-audit.entity';
@Entity('amenities')
export class Amenities extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'code', length: 64 })
  code!: string;

  @Column({ type: 'varchar', name: 'name', length: 120 })
  name!: string;

}

@Entity('properties')
export class Properties extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'destination_id', length: 36 })
  destinationId!: string;

  @Column({ type: 'varchar', name: 'name', length: 255 })
  name!: string;

  @Column({ type: 'varchar', name: 'slug', length: 255 })
  slug!: string;

  @Column({ name: 'property_type', enum: ["hotel","resort","apartment","villa","hostel","other"] })
  propertyType!: 'hotel' | 'resort' | 'apartment' | 'villa' | 'hostel' | 'other';

  @Column({ type: 'decimal', name: 'star_rating', precision: 2, scale: 1, nullable: true })
  starRating!: string;

  @Column({ type: 'text', name: 'description', nullable: true })
  description!: string;

  @Column({ type: 'varchar', name: 'address_line', length: 255, nullable: true })
  addressLine!: string;

}

@Entity('property_images')
export class PropertyImages extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'property_id', length: 36 })
  propertyId!: string;

  @Column({ type: 'varchar', name: 'url', length: 512 })
  url!: string;

  @Column({ type: 'varchar', name: 'caption', length: 255, nullable: true })
  caption!: string;

  @Column({ type: 'int', name: 'sort_order' })
  sortOrder!: number;

}

@Entity('property_amenities')
export class PropertyAmenities extends BaseAuditEntity {
  @PrimaryColumn({ name: 'property_id', length: 36 })
  propertyId!: string;

  @PrimaryColumn({ name: 'amenity_id', length: 36 })
  amenityId!: string;

}

@Entity('rooms')
export class Rooms extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'property_id', length: 36 })
  propertyId!: string;

  @Column({ type: 'varchar', name: 'name', length: 120 })
  name!: string;

  @Column({ type: 'varchar', name: 'room_type', length: 80, nullable: true })
  roomType!: string;

  @Column({ type: 'int', name: 'max_guests' })
  maxGuests!: number;

  @Column({ type: 'varchar', name: 'bed_config', length: 120, nullable: true })
  bedConfig!: string;

  @Column({ type: 'int', name: 'base_price_cents' })
  basePriceCents!: number;

  @Column({ type: 'varchar', name: 'currency', length: 3 })
  currency!: string;

}

@Entity('room_availability')
export class RoomAvailability extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'room_id', length: 36 })
  roomId!: string;

  @Column({ type: 'date', name: 'date' })
  date!: string;

  @Column({ type: 'int', name: 'available_units' })
  availableUnits!: number;

  @Column({ type: 'int', name: 'price_cents' })
  priceCents!: number;

}