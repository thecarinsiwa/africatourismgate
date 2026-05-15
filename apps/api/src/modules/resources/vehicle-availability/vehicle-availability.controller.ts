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
import { VehicleAvailability } from '../../../entities/generated';
import { VehicleAvailabilityService } from './vehicle-availability.service';

@ApiTags('vehicle-availability')
@Controller('vehicle-availability')
export class VehicleAvailabilityController {
  constructor(private readonly service: VehicleAvailabilityService) {}

  @Get()
  @ApiOperation({ summary: 'List vehicle-availability' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vehicle-availability by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create vehicle-availability' })
  create(@Body() dto: DeepPartial<VehicleAvailability>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update vehicle-availability' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<VehicleAvailability>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete vehicle-availability' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
