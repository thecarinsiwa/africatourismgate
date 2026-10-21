import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseAuditEntity } from '../common/entities/base-audit.entity';

/**
 * Catalogue global de devises (plateforme) — ISO 4217.
 * Soft-delete + `is_active` pour retirer des sélecteurs sans casser l’historique.
 */
@Entity('currencies')
export class Currencies extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'char', name: 'code', length: 3 })
  code!: string;

  @Column({ type: 'varchar', name: 'label', length: 120 })
  label!: string;

  @Column({ type: 'varchar', name: 'symbol', length: 16, nullable: true })
  symbol!: string | null;

  @Column({ type: 'tinyint', name: 'decimal_places', default: 2 })
  decimalPlaces!: number;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ type: 'int', name: 'sort_order', default: 0 })
  sortOrder!: number;
}
