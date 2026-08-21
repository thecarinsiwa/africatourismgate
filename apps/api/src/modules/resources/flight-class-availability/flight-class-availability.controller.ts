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
import { BulkUpsertFlightClassAvailabilityDto } from './dto/bulk-upsert-flight-class-availability.dto';
import { CreateFlightClassAvailabilityDto } from './dto/create-flight-class-availability.dto';
import { FlightClassAvailabilityListQueryDto } from './dto/flight-class-availability-list-query.dto';
import { UpdateFlightClassAvailabilityDto } from './dto/update-flight-class-availability.dto';
import { FlightClassAvailabilityService } from './flight-class-availability.service';

@ApiTags('flight-class-availability')
@Controller('flight-class-availability')
export class FlightClassAvailabilityController {
  constructor(private readonly service: FlightClassAvailabilityService) {}

  @Get()
  @ApiOperation({ summary: 'List flight class availability' })
  findAll(@Query() query: FlightClassAvailabilityListQueryDto) {
    return this.service.findAll(query);
  }

  @Put('bulk')
  @ApiOperation({ summary: 'Bulk upsert availability for a date range' })
  bulkUpsert(@Body() dto: BulkUpsertFlightClassAvailabilityDto) {
    return this.service.bulkUpsert(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get flight class availability by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create flight class availability' })
  create(@Body() dto: CreateFlightClassAvailabilityDto) {
    return this.service.createAvailability(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update flight class availability' })
  update(@Param('id') id: string, @Body() dto: UpdateFlightClassAvailabilityDto) {
    return this.service.updateAvailability(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete flight class availability' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
