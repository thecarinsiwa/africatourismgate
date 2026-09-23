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
import { BookingItems } from '../../../entities/generated';
import { BookingItemsService } from './booking-items.service';
import { BookingItemsListQueryDto } from './dto/booking-items-list-query.dto';

@ApiTags('booking-items')
@Controller('booking-items')
export class BookingItemsController {
  constructor(private readonly service: BookingItemsService) {}

  @Get()
  @ApiOperation({ summary: 'List booking-items' })
  findAll(@Query() query: BookingItemsListQueryDto) {
    return this.service.listForAdmin(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking-items by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create booking-items' })
  create(@Body() dto: DeepPartial<BookingItems>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update booking-items' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<BookingItems>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete booking-items' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
