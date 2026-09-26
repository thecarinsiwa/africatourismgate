import { ApiProperty } from '@nestjs/swagger';
import {
  SupportTicketDto,
  SupportTicketMessageDto,
} from './support-ticket-created.dto';

/** Owner-scoped ticket detail with message thread. */
export class CustomerSupportTicketDetailDto extends SupportTicketDto {
  @ApiProperty({ type: [SupportTicketMessageDto] })
  messages!: SupportTicketMessageDto[];
}
