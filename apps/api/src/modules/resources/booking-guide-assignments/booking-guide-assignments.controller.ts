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
import { BookingGuideAssignments } from '../../../entities/generated';
import { BookingGuideAssignmentsService } from './booking-guide-assignments.service';

@ApiTags('booking-guide-assignments')
@Controller('booking-guide-assignments')
export class BookingGuideAssignmentsController {
  constructor(private readonly service: BookingGuideAssignmentsService) {}

  @Get()
  @ApiOperation({ summary: 'List booking-guide-assignments' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking-guide-assignments by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create booking-guide-assignments' })
  create(@Body() dto: DeepPartial<BookingGuideAssignments>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update booking-guide-assignments' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<BookingGuideAssignments>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete booking-guide-assignments' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
