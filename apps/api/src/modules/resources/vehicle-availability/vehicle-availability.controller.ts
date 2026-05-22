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
import { CreateVehicleAvailabilityDto } from './dto/create-vehicle-availability.dto';
import { UpdateVehicleAvailabilityDto } from './dto/update-vehicle-availability.dto';
import { VehicleAvailabilityListQueryDto } from './dto/vehicle-availability-list-query.dto';
import { VehicleAvailabilityService } from './vehicle-availability.service';

@ApiTags('vehicle-availability')
@Controller('vehicle-availability')
export class VehicleAvailabilityController {
  constructor(private readonly service: VehicleAvailabilityService) {}

  @Get()
  @ApiOperation({ summary: 'List vehicle availability slots' })
  findAll(@Query() query: VehicleAvailabilityListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vehicle availability by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create vehicle availability slot' })
  create(@Body() dto: CreateVehicleAvailabilityDto) {
    return this.service.createSlot(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update vehicle availability slot' })
  update(@Param('id') id: string, @Body() dto: UpdateVehicleAvailabilityDto) {
    return this.service.updateSlot(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete vehicle availability' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
