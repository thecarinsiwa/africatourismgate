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
import { BookingMessages } from '../../../entities/generated';
import { BookingMessagesService } from './booking-messages.service';

@ApiTags('booking-messages')
@Controller('booking-messages')
export class BookingMessagesController {
  constructor(private readonly service: BookingMessagesService) {}

  @Get()
  @ApiOperation({ summary: 'List booking-messages' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking-messages by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create booking-messages' })
  create(@Body() dto: DeepPartial<BookingMessages>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update booking-messages' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<BookingMessages>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete booking-messages' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
