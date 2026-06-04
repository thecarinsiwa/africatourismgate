import { Entity, Column, PrimaryColumn } from 'typeorm';
import { BaseAuditEntity } from '../../common/entities/base-audit.entity';
@Entity('packages')
export class Packages extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'name', length: 180 })
  name!: string;

  @Column({ type: 'text', name: 'description', nullable: true })
  description!: string;

  @Column({ type: 'decimal', name: 'discount_percent', precision: 5, scale: 2 })
  discountPercent!: string;

  @Column({ type: 'int', name: 'active' })
  active!: number;

}

@Entity('package_items')
export class PackageItems extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'package_id', length: 36 })
  packageId!: string;

  @Column({ name: 'item_type', enum: ["property","flight","vehicle","cruise","activity"] })
  itemType!: 'property' | 'flight' | 'vehicle' | 'cruise' | 'activity';

  @Column({ type: 'varchar', name: 'item_id', length: 36 })
  itemId!: string;

}