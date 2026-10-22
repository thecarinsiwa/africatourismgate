import { Entity, Column, PrimaryColumn } from 'typeorm';
import { BaseAuditEntity } from '../../common/entities/base-audit.entity';
@Entity('reviews')
export class Reviews extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'user_id', length: 36, nullable: true })
  userId!: string | null;

  @Column({ name: 'source', enum: ['platform', 'tripadvisor'], default: 'platform' })
  source!: 'platform' | 'tripadvisor';

  @Column({
    name: 'entity_type',
    enum: [
      'property',
      'flight',
      'vehicle',
      'cruise',
      'activity',
      'booking',
      'tour_guide',
      'tripadvisor',
    ],
  })
  entityType!:
    | 'property'
    | 'flight'
    | 'vehicle'
    | 'cruise'
    | 'activity'
    | 'booking'
    | 'tour_guide'
    | 'tripadvisor';

  @Column({ type: 'varchar', name: 'entity_id', length: 36 })
  entityId!: string;

  @Column({ type: 'int', name: 'rating' })
  rating!: number;

  @Column({ type: 'varchar', name: 'title', length: 180, nullable: true })
  title!: string | null;

  @Column({ type: 'text', name: 'body', nullable: true })
  body!: string | null;

  @Column({ type: 'varchar', name: 'external_author_name', length: 120, nullable: true })
  externalAuthorName!: string | null;

  @Column({ name: 'status', enum: ['pending', 'approved', 'hidden'] })
  status!: 'pending' | 'approved' | 'hidden';
}
