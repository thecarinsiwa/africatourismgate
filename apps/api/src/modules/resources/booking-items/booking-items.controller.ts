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
import { ApiForbiddenResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DeepPartial } from 'typeorm';
import { BookingItems } from '../../../entities/generated';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { BookingItemsService } from './booking-items.service';
import { BookingItemsListQueryDto } from './dto/booking-items-list-query.dto';

@ApiTags('booking-items')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('booking-items')
export class BookingItemsController {
  constructor(private readonly service: BookingItemsService) {}

  @Get()
  @RequirePermissions('bookings.read')
  @ApiOperation({ summary: 'List booking items (enriched, filterable)' })
  findAll(@Query() query: BookingItemsListQueryDto) {
    return this.service.list(query);
  }

  @Get(':id')
  @RequirePermissions('bookings.read')
  @ApiOperation({ summary: 'Get booking-items by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermissions('bookings.write')
  @ApiOperation({ summary: 'Create booking-items' })
  create(@Body() dto: DeepPartial<BookingItems>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('bookings.write')
  @ApiOperation({ summary: 'Update booking-items' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<BookingItems>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('bookings.write')
  @ApiOperation({ summary: 'Soft-delete booking-items' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
