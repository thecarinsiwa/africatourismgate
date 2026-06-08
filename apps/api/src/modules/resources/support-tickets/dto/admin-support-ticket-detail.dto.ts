import { ApiProperty } from '@nestjs/swagger';
import { AdminSupportTicketListItemDto } from './admin-support-ticket-list-item.dto';
import { SupportTicketMessageDto } from './support-ticket-created.dto';

export class AdminSupportTicketDetailDto extends AdminSupportTicketListItemDto {
  @ApiProperty({ type: [SupportTicketMessageDto] })
  messages!: SupportTicketMessageDto[];
}
