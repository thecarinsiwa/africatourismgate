import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

export type BookingIdentityDocumentType =
  | 'passport'
  | 'national_id'
  | 'drivers_license'
  | 'other';

export type BookingIdentityDocumentStatus =
  | 'pending_review'
  | 'approved'
  | 'resubmit_requested'
  | 'rejected';

@Entity('booking_identity_documents')
export class BookingIdentityDocuments {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'booking_id', length: 36 })
  bookingId!: string;

  @Column({ type: 'varchar', name: 'user_id', length: 36 })
  userId!: string;

  @Column({
    name: 'document_type',
    type: 'enum',
    enum: ['passport', 'national_id', 'drivers_license', 'other'],
  })
  documentType!: BookingIdentityDocumentType;

  @Column({ type: 'varchar', name: 'original_filename', length: 255 })
  originalFilename!: string;

  @Column({ type: 'varchar', name: 'stored_filename', length: 255 })
  storedFilename!: string;

  @Column({ type: 'varchar', name: 'mime_type', length: 127 })
  mimeType!: string;

  @Column({ type: 'int', name: 'file_size_bytes', unsigned: true })
  fileSizeBytes!: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['pending_review', 'approved', 'resubmit_requested', 'rejected'],
    default: 'pending_review',
  })
  status!: BookingIdentityDocumentStatus;

  @Column({ type: 'text', name: 'staff_note', nullable: true })
  staffNote!: string | null;

  @Column({ type: 'varchar', name: 'reviewed_by_user_id', length: 36, nullable: true })
  reviewedByUserId!: string | null;

  @Column({ type: 'datetime', name: 'reviewed_at', nullable: true })
  reviewedAt!: Date | null;

  @Column({ type: 'int', name: 'version', unsigned: true, default: 1 })
  version!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @Column({ type: 'datetime', name: 'deleted_at', nullable: true })
  deletedAt!: Date | null;
}
