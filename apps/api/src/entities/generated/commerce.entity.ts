import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';
import { BaseAuditEntity } from '../../common/entities/base-audit.entity';
@Entity('bookings')
export class Bookings extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'user_id', length: 36 })
  userId!: string;

  @Column({ name: 'status', enum: ["draft","pending_approval","pending_payment","confirmed","cancelled","refunded"] })
  status!: 'draft' | 'pending_approval' | 'pending_payment' | 'confirmed' | 'cancelled' | 'refunded';

  @Column({ type: 'int', name: 'total_cents' })
  totalCents!: number;

  @Column({ type: 'varchar', name: 'currency', length: 3 })
  currency!: string;

  @Column({ type: 'varchar', name: 'promo_code_id', length: 36, nullable: true })
  promoCodeId!: string | null;

  @Column({ type: 'varchar', name: 'promotion_id', length: 36, nullable: true })
  promotionId!: string | null;

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
  startDate!: string | null;

  @Column({ type: 'date', name: 'end_date', nullable: true })
  endDate!: string | null;

}

@Entity('booking_status_history')
export class BookingStatusHistory {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'booking_id', length: 36 })
  bookingId!: string;

  @Column({ name: 'from_status', enum: ["draft","pending_approval","pending_payment","confirmed","cancelled","refunded"], nullable: true })
  fromStatus!: 'draft' | 'pending_approval' | 'pending_payment' | 'confirmed' | 'cancelled' | 'refunded';

  @Column({ name: 'to_status', enum: ["draft","pending_approval","pending_payment","confirmed","cancelled","refunded"] })
  toStatus!: 'draft' | 'pending_approval' | 'pending_payment' | 'confirmed' | 'cancelled' | 'refunded';

  @Column({ type: 'text', name: 'reason', nullable: true })
  reason!: string | null;

  @Column({ type: 'varchar', name: 'changed_by_user_id', length: 36, nullable: true })
  changedByUserId!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

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
  provider!: string | null;

  @Column({ type: 'varchar', name: 'external_id', length: 255, nullable: true })
  externalId!: string | null;

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
  maxRedemptions!: number | null;

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
  description!: string | null;

  @Column({ name: 'discount_type', enum: ["percent","fixed_amount"], nullable: true })
  discountType!: 'percent' | 'fixed_amount';

  @Column({ type: 'decimal', name: 'discount_value', precision: 12, scale: 2, nullable: true })
  discountValue!: string | null;

  @Column({ type: 'date', name: 'valid_from', nullable: true })
  validFrom!: string | null;

  @Column({ type: 'date', name: 'valid_until', nullable: true })
  validUntil!: string | null;

  @Column({ type: 'int', name: 'max_redemptions', nullable: true })
  maxRedemptions!: number | null;

  @Column({ type: 'int', name: 'redemption_count' })
  redemptionCount!: number;

  @Column({ type: 'int', name: 'active' })
  active!: number;

}