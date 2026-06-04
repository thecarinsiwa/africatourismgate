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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DeepPartial } from 'typeorm';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { SupportTickets } from '../../../entities/generated';
import { SupportTicketsService } from './support-tickets.service';

@ApiTags('support-tickets')
@Controller('support-tickets')
export class SupportTicketsController {
  constructor(private readonly service: SupportTicketsService) {}

  @Get()
  @ApiOperation({ summary: 'List support-tickets' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get support-tickets by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create support-tickets' })
  create(@Body() dto: DeepPartial<SupportTickets>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update support-tickets' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<SupportTickets>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete support-tickets' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
