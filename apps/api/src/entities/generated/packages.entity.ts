import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';
import { BaseAuditEntity } from '../../common/entities/base-audit.entity';
@Entity('packages')
export class Packages extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'name', length: 180 })
  name!: string;

  @Column({ type: 'varchar', name: 'description', length: 5000, nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', name: 'cover_image_url', length: 512, nullable: true })
  coverImageUrl!: string | null;

  @Column({ type: 'decimal', name: 'discount_percent', precision: 5, scale: 2 })
  discountPercent!: string;

  @Column({ type: 'int', name: 'duration_days' })
  durationDays!: number;

  @Column({ type: 'int', name: 'active' })
  active!: number;

  @Column({ type: 'int', name: 'is_featured' })
  isFeatured!: number;

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

@Entity('package_description_assets')
export class PackageDescriptionAssets extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'package_id', length: 36 })
  packageId!: string;

  @Column({ name: 'asset_type', enum: ["image","pdf","word"] })
  assetType!: 'image' | 'pdf' | 'word';

  @Column({ type: 'varchar', name: 'url', length: 1024 })
  url!: string;

  @Column({ type: 'varchar', name: 'name', length: 255, nullable: true })
  name!: string | null;

  @Column({ type: 'int', name: 'sort_order' })
  sortOrder!: number;

}