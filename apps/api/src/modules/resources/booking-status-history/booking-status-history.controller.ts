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
import { BookingStatusHistory } from '../../../entities/generated';
import { BookingStatusHistoryService } from './booking-status-history.service';

@ApiTags('booking-status-history')
@Controller('booking-status-history')
export class BookingStatusHistoryController {
  constructor(private readonly service: BookingStatusHistoryService) {}

  @Get()
  @ApiOperation({ summary: 'List booking-status-history' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking-status-history by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create booking-status-history' })
  create(@Body() dto: DeepPartial<BookingStatusHistory>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update booking-status-history' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<BookingStatusHistory>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete booking-status-history' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
