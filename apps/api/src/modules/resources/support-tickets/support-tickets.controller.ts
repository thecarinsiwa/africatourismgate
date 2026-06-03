import {
  Body,
  Controller,
  Delete,
  Get,
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
import { DeepPartial } from 'typeorm';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { SupportTickets } from '../../../entities/generated';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { SupportTicketCreatedDto } from './dto/support-ticket-created.dto';
import { SupportTicketsService } from './support-tickets.service';

@ApiTags('support-tickets')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('support-tickets')
export class SupportTicketsController {
  constructor(private readonly service: SupportTicketsService) {}

  @Get()
  @RequirePermissions('support_tickets.read')
  @ApiOperation({ summary: 'List support tickets (scoped to current user unless staff)' })
  findAll(
    @Query() query: PaginationQueryDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.listForUser(query, user.id);
  }

  @Get(':id')
  @RequirePermissions('support_tickets.read')
  @ApiOperation({ summary: 'Get support ticket by id' })
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
    return this.service.findOneForUser(id, user.id);
  }

  @Post()
  @RequirePermissions('support_tickets.write')
  @ApiOperation({
    summary: 'Open a support ticket with an initial message',
  })
  create(
    @Body() dto: CreateSupportTicketDto,
    @CurrentUser() user: AuthUserDto,
  ): Promise<SupportTicketCreatedDto> {
    return this.service.createWithInitialMessage(dto, user.id);
  }

  @Patch(':id')
  @RequirePermissions('support_tickets.write')
  @ApiOperation({ summary: 'Update support ticket (owner or staff)' })
  async update(
    @Param('id') id: string,
    @Body() dto: DeepPartial<SupportTickets>,
    @CurrentUser() user: AuthUserDto,
  ) {
    await this.service.assertStaffOrOwnerForMutation(id, user.id);
    return this.service.update(id, dto, user.id);
  }

  @Delete(':id')
  @RequirePermissions('support_tickets.write')
  @ApiOperation({ summary: 'Soft-delete support ticket (owner or staff)' })
  async remove(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
    await this.service.assertStaffOrOwnerForMutation(id, user.id);
    return this.service.remove(id, user.id);
  }
}
