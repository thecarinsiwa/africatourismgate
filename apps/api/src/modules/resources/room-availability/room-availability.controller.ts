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
import { RoomAvailability } from '../../../entities/generated';
import { RoomAvailabilityService } from './room-availability.service';

@ApiTags('room-availability')
@Controller('room-availability')
export class RoomAvailabilityController {
  constructor(private readonly service: RoomAvailabilityService) {}

  @Get()
  @ApiOperation({ summary: 'List room-availability' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get room-availability by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create room-availability' })
  create(@Body() dto: DeepPartial<RoomAvailability>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update room-availability' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<RoomAvailability>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete room-availability' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
