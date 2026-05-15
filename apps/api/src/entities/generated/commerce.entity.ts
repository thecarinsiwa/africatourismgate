import { Entity, Column, PrimaryColumn } from 'typeorm';
import { BaseAuditEntity } from '../../common/entities/base-audit.entity';
@Entity('bookings')
export class Bookings extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'user_id', length: 36 })
  userId!: string;

  @Column({ name: 'status', enum: ["draft","pending_payment","confirmed","cancelled","refunded"] })
  status!: 'draft' | 'pending_payment' | 'confirmed' | 'cancelled' | 'refunded';

  @Column({ type: 'int', name: 'total_cents' })
  totalCents!: number;

  @Column({ type: 'varchar', name: 'currency', length: 3 })
  currency!: string;

  @Column({ type: 'varchar', name: 'promo_code_id', length: 36, nullable: true })
  promoCodeId!: string;

}

@Entity('booking_items')
export class BookingItems extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'booking_id', length: 36 })
  bookingId!: string;

  @Column({ name: 'item_type', enum: ["room","flight_class","vehicle","cabin","activity_schedule","package"] })
  itemType!: 'room' | 'flight_class' | 'vehicle' | 'cabin' | 'activity_schedule' | 'package';

  @Column({ type: 'varchar', name: 'reference_id', length: 36 })
  referenceId!: string;

  @Column({ type: 'varchar', name: 'title_snapshot', length: 255 })
  titleSnapshot!: string;

  @Column({ type: 'int', name: 'quantity' })
  quantity!: number;

  @Column({ type: 'int', name: 'unit_price_cents' })
  unitPriceCents!: number;

  @Column({ type: 'date', name: 'start_date', nullable: true })
  startDate!: string;

  @Column({ type: 'date', name: 'end_date', nullable: true })
  endDate!: string;

}

@Entity('payments')
export class Payments extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'booking_id', length: 36 })
  bookingId!: string;

  @Column({ type: 'int', name: 'amount_cents' })
  amountCents!: number;

  @Column({ type: 'varchar', name: 'currency', length: 3 })
  currency!: string;

  @Column({ name: 'status', enum: ["pending","succeeded","failed","refunded"] })
  status!: 'pending' | 'succeeded' | 'failed' | 'refunded';

  @Column({ type: 'varchar', name: 'provider', length: 64, nullable: true })
  provider!: string;

  @Column({ type: 'varchar', name: 'external_id', length: 255, nullable: true })
  externalId!: string;

}

@Entity('promo_codes')
export class PromoCodes extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'code', length: 64 })
  code!: string;

  @Column({ name: 'discount_type', enum: ["percent","fixed_amount"] })
  discountType!: 'percent' | 'fixed_amount';

  @Column({ type: 'decimal', name: 'discount_value', precision: 12, scale: 2 })
  discountValue!: string;

  @Column({ type: 'date', name: 'valid_from' })
  validFrom!: string;

  @Column({ type: 'date', name: 'valid_until' })
  validUntil!: string;

  @Column({ type: 'int', name: 'max_redemptions', nullable: true })
  maxRedemptions!: number;

  @Column({ type: 'int', name: 'redemption_count' })
  redemptionCount!: number;

  @Column({ type: 'int', name: 'active' })
  active!: number;

}

@Entity('promotions')
export class Promotions extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'name', length: 180 })
  name!: string;

  @Column({ type: 'text', name: 'description', nullable: true })
  description!: string;

  @Column({ type: 'int', name: 'active' })
  active!: number;

}