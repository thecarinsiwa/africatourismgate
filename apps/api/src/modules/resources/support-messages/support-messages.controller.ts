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
import { DeepPartial } from 'typeorm';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { SupportMessages } from '../../../entities/generated';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { CreateSupportMessageDto } from './dto/create-support-message.dto';
import { CreateSupportMessageResponseDto } from './dto/create-support-message-response.dto';
import { SupportMessagesService } from './support-messages.service';

@ApiTags('support-messages')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('support-messages')
export class SupportMessagesController {
  constructor(private readonly service: SupportMessagesService) {}

  @Get()
  @ApiOperation({ summary: 'List support-messages' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get support-messages by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('support_tickets.write')
  @ApiOperation({ summary: 'Post a staff reply on a support ticket' })
  create(
    @Body() dto: CreateSupportMessageDto,
    @CurrentUser() user: AuthUserDto,
  ): Promise<CreateSupportMessageResponseDto> {
    return this.service.createStaffReply(dto, user.id);
  }

  @Patch(':id')
  @RequirePermissions('support_tickets.write')
  @ApiOperation({ summary: 'Update support-messages' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<SupportMessages>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('support_tickets.write')
  @ApiOperation({ summary: 'Soft-delete support-messages' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
