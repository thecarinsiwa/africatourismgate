import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

export type BookingManifestSex = 'M' | 'F' | 'other';

@Entity('booking_manifest_entries')
export class BookingManifestEntries {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'booking_id', length: 36 })
  bookingId!: string;

  @Column({ type: 'smallint', name: 'sort_order', unsigned: true, default: 0 })
  sortOrder!: number;

  @Column({ type: 'varchar', name: 'full_name', length: 200 })
  fullName!: string;

  @Column({ type: 'tinyint', name: 'age', unsigned: true, nullable: true })
  age!: number | null;

  @Column({
    name: 'sex',
    type: 'enum',
    enum: ['M', 'F', 'other'],
    nullable: true,
  })
  sex!: BookingManifestSex | null;

  @Column({ type: 'varchar', name: 'nationality', length: 100, nullable: true })
  nationality!: string | null;

  @Column({ type: 'varchar', name: 'id_number', length: 64, nullable: true })
  idNumber!: string | null;

  @Column({ type: 'text', name: 'conditions', nullable: true })
  conditions!: string | null;

  @Column({ type: 'text', name: 'comment', nullable: true })
  comment!: string | null;

  @Column({ type: 'text', name: 'other', nullable: true })
  other!: string | null;

  @Column({ type: 'varchar', name: 'created_by_user_id', length: 36, nullable: true })
  createdByUserId!: string | null;

  @Column({ type: 'varchar', name: 'updated_by_user_id', length: 36, nullable: true })
  updatedByUserId!: string | null;

  @Column({ type: 'varchar', name: 'deleted_by_user_id', length: 36, nullable: true })
  deletedByUserId!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt!: Date | null;

  @Column({ type: 'datetime', name: 'deleted_at', nullable: true })
  deletedAt!: Date | null;
}
