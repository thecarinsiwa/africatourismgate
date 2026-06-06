import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import type { SupportTickets } from '../../../../entities/generated';

const TICKET_STATUSES = [
  'open',
  'pending',
  'resolved',
  'closed',
] as const satisfies readonly SupportTickets['status'][];

const TICKET_PRIORITIES = [
  'low',
  'normal',
  'high',
  'urgent',
] as const satisfies readonly SupportTickets['priority'][];

export class UpdateSupportTicketStatusDto {
  @ApiPropertyOptional({ enum: TICKET_STATUSES })
  @IsOptional()
  @IsIn(TICKET_STATUSES)
  status?: SupportTickets['status'];

  @ApiPropertyOptional({ enum: TICKET_PRIORITIES })
  @IsOptional()
  @IsIn(TICKET_PRIORITIES)
  priority?: SupportTickets['priority'];
}
