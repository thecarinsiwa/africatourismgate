import { Entity, Column, PrimaryColumn } from 'typeorm';
import { BaseAuditEntity } from '../../common/entities/base-audit.entity';
@Entity('support_tickets')
export class SupportTickets extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'user_id', length: 36 })
  userId!: string;

  @Column({ type: 'varchar', name: 'subject', length: 255 })
  subject!: string;

  @Column({ name: 'status', enum: ["open","pending","resolved","closed"] })
  status!: 'open' | 'pending' | 'resolved' | 'closed';

}

@Entity('support_messages')
export class SupportMessages extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'ticket_id', length: 36 })
  ticketId!: string;

  @Column({ type: 'varchar', name: 'user_id', length: 36, nullable: true })
  userId!: string;

  @Column({ type: 'text', name: 'body' })
  body!: string;

  @Column({ type: 'int', name: 'is_staff' })
  isStaff!: number;

}