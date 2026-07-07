import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseAuditEntity } from '../common/entities/base-audit.entity';

export type HeroSlideStatus = 'draft' | 'published';

@Entity('hero_slides')
export class HeroSlides extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'subtitle', length: 255 })
  subtitle!: string;

  @Column({ type: 'varchar', name: 'title', length: 255 })
  title!: string;

  @Column({ type: 'text', name: 'description' })
  description!: string;

  @Column({ type: 'varchar', name: 'image_url', length: 1024 })
  imageUrl!: string;

  @Column({ type: 'varchar', name: 'image_alt', length: 255 })
  imageAlt!: string;

  @Column({ type: 'varchar', name: 'href', length: 512, nullable: true })
  href!: string | null;

  @Column({ type: 'int', name: 'sort_order', default: 0 })
  sortOrder!: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['draft', 'published'],
    default: 'draft',
  })
  status!: HeroSlideStatus;

  @Column({ type: 'varchar', name: 'locale', length: 5, default: 'fr' })
  locale!: string;
}
