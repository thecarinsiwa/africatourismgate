import { ApiProperty } from '@nestjs/swagger';
import { SupportTicketMessageDto } from '../../support-tickets/dto/support-ticket-created.dto';

export class CreateSupportMessageResponseDto {
  @ApiProperty({ type: SupportTicketMessageDto })
  message!: SupportTicketMessageDto;

  @ApiProperty({ enum: ['open', 'pending', 'resolved', 'closed'] })
  ticketStatus!: 'open' | 'pending' | 'resolved' | 'closed';
}
