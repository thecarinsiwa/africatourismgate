import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseAuditEntity } from '../common/entities/base-audit.entity';

@Entity('mobile_money_payment_numbers')
export class MobileMoneyPaymentNumbers extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'operator_id', length: 36 })
  operatorId!: string;

  @Column({ type: 'varchar', name: 'phone_e164', length: 32 })
  phoneE164!: string;

  @Column({ type: 'varchar', name: 'label', length: 120, nullable: true })
  label!: string | null;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ type: 'int', name: 'sort_order', default: 0 })
  sortOrder!: number;
}
