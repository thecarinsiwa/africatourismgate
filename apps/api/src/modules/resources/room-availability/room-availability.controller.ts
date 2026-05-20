import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BulkUpsertRoomAvailabilityDto } from './dto/bulk-upsert-room-availability.dto';
import { CreateRoomAvailabilityDto } from './dto/create-room-availability.dto';
import { RoomAvailabilityListQueryDto } from './dto/room-availability-list-query.dto';
import { UpdateRoomAvailabilityDto } from './dto/update-room-availability.dto';
import { RoomAvailabilityService } from './room-availability.service';

@ApiTags('room-availability')
@Controller('room-availability')
export class RoomAvailabilityController {
  constructor(private readonly service: RoomAvailabilityService) {}

  @Get()
  @ApiOperation({ summary: 'List room availability' })
  findAll(@Query() query: RoomAvailabilityListQueryDto) {
    return this.service.findAll(query);
  }

  @Put('bulk')
  @ApiOperation({ summary: 'Bulk upsert availability for a date range' })
  bulkUpsert(@Body() dto: BulkUpsertRoomAvailabilityDto) {
    return this.service.bulkUpsert(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get room availability by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create room availability' })
  create(@Body() dto: CreateRoomAvailabilityDto) {
    return this.service.createAvailability(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update room availability' })
  update(@Param('id') id: string, @Body() dto: UpdateRoomAvailabilityDto) {
    return this.service.updateAvailability(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete room availability' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
