import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseAuditEntity } from '../common/entities/base-audit.entity';

export type HappyCustomersStatus = 'draft' | 'published';

@Entity('happy_customers_sections')
export class HappyCustomersSections extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'title', length: 255 })
  title!: string;

  @Column({ type: 'text', name: 'subtitle' })
  subtitle!: string;

  @Column({ type: 'text', name: 'paragraph1' })
  paragraph1!: string;

  @Column({ type: 'text', name: 'paragraph2' })
  paragraph2!: string;

  @Column({ type: 'varchar', name: 'image_url', length: 1024 })
  imageUrl!: string;

  @Column({ type: 'varchar', name: 'image_alt', length: 255 })
  imageAlt!: string;

  @Column({ type: 'varchar', name: 'badge_value', length: 32, default: '10K+' })
  badgeValue!: string;

  @Column({ type: 'varchar', name: 'badge_label', length: 64, default: 'Clients' })
  badgeLabel!: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['draft', 'published'],
    default: 'draft',
  })
  status!: HappyCustomersStatus;

  @Column({ type: 'varchar', name: 'locale', length: 5, default: 'fr' })
  locale!: string;
}
