import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { AdminSupportTicketDetailDto } from './dto/admin-support-ticket-detail.dto';
import { AdminSupportTicketListItemDto } from './dto/admin-support-ticket-list-item.dto';
import { CreateCustomerSupportMessageDto } from './dto/create-customer-support-message.dto';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { CustomerSupportTicketDetailDto } from './dto/customer-support-ticket-detail.dto';
import {
  SupportTicketCreatedDto,
  SupportTicketDto,
} from './dto/support-ticket-created.dto';
import { SupportTicketsListQueryDto } from './dto/support-tickets-list-query.dto';
import { UpdateSupportTicketStatusDto } from './dto/update-support-ticket-status.dto';
import { CreateSupportMessageResponseDto } from '../support-messages/dto/create-support-message-response.dto';
import { SupportMessagesService } from '../support-messages/support-messages.service';
import { SupportTicketsService } from './support-tickets.service';

@ApiTags('support-tickets')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('support-tickets')
export class SupportTicketsController {
  constructor(
    private readonly service: SupportTicketsService,
    private readonly messagesService: SupportMessagesService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List support tickets (scoped to current user unless staff)',
  })
  findAll(
    @Query() query: SupportTicketsListQueryDto,
    @CurrentUser() user: AuthUserDto,
  ): Promise<{
    data: (SupportTicketDto | AdminSupportTicketListItemDto)[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    return this.service.list(query, user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary:
      'Get support ticket by id (staff: admin detail; customer: own ticket + messages)',
  })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthUserDto,
  ): Promise<CustomerSupportTicketDetailDto | AdminSupportTicketDetailDto> {
    return this.service.findOneForActor(id, user.id);
  }

  @Post(':id/messages')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Post a customer reply on an owned support ticket',
  })
  createCustomerMessage(
    @Param('id') id: string,
    @Body() dto: CreateCustomerSupportMessageDto,
    @CurrentUser() user: AuthUserDto,
  ): Promise<CreateSupportMessageResponseDto> {
    return this.messagesService.createCustomerReply(id, dto.body, user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Open a support ticket with an initial message' })
  create(
    @Body() dto: CreateSupportTicketDto,
    @CurrentUser() user: AuthUserDto,
  ): Promise<SupportTicketCreatedDto> {
    return this.service.createTicket(dto, user.id);
  }

  @Patch(':id')
  @RequirePermissions('support_tickets.write')
  @ApiOperation({ summary: 'Update support ticket status or priority (staff)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSupportTicketStatusDto,
    @CurrentUser() user: AuthUserDto,
  ): Promise<AdminSupportTicketDetailDto> {
    return this.service.updateTicket(id, dto, user.id);
  }

  @Delete(':id')
  @RequirePermissions('support_tickets.write')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete support ticket (staff)' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthUserDto,
  ): Promise<void> {
    await this.service.removeTicket(id, user.id);
  }
}
