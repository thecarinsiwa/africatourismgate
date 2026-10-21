import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseAuditEntity } from '../common/entities/base-audit.entity';

/**
 * Taux de change manuels (MVP) — conversion à la comptabilisation.
 * Convention : 1 unité `fromCurrency` = `rate` unités `toCurrency`.
 */
@Entity('exchange_rates')
export class ExchangeRates extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'organization_id', length: 36 })
  organizationId!: string;

  @Column({ type: 'char', name: 'from_currency', length: 3 })
  fromCurrency!: string;

  @Column({ type: 'char', name: 'to_currency', length: 3 })
  toCurrency!: string;

  @Column({
    type: 'decimal',
    name: 'rate',
    precision: 18,
    scale: 8,
    transformer: {
      to: (value: number) => value,
      from: (value: string | number | null) =>
        value == null ? 0 : Number(value),
    },
  })
  rate!: number;

  @Column({ type: 'date', name: 'effective_on' })
  effectiveOn!: string;

  @Column({ type: 'varchar', name: 'notes', length: 500, nullable: true })
  notes!: string | null;
}
