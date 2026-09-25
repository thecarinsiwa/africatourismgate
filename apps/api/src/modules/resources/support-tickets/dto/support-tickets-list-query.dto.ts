import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';
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

const SORT_BY = ['createdAt', 'lastMessageAt'] as const;

export class SupportTicketsListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Partial match on subject, customer email/name, or ticket id',
  })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  search?: string;

  @ApiPropertyOptional({ enum: TICKET_STATUSES })
  @IsOptional()
  @IsIn(TICKET_STATUSES)
  status?: SupportTickets['status'];

  @ApiPropertyOptional({ enum: TICKET_PRIORITIES })
  @IsOptional()
  @IsIn(TICKET_PRIORITIES)
  priority?: SupportTickets['priority'];

  @ApiPropertyOptional({
    enum: SORT_BY,
    description: 'Sort tickets by creation date or latest message activity',
  })
  @IsOptional()
  @IsIn(SORT_BY)
  sortBy?: (typeof SORT_BY)[number];
}
