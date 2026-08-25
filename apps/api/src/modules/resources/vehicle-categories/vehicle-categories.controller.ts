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
import { VehicleCategories } from '../../../entities/generated';
import { VehicleCategoriesService } from './vehicle-categories.service';
import { VehicleCategoriesListQueryDto } from './dto/vehicle-categories-list-query.dto';

@ApiTags('vehicle-categories')
@Controller('vehicle-categories')
export class VehicleCategoriesController {
  constructor(private readonly service: VehicleCategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List vehicle-categories' })
  findAll(@Query() query: VehicleCategoriesListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vehicle-categories by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create vehicle-categories' })
  create(@Body() dto: DeepPartial<VehicleCategories>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update vehicle-categories' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<VehicleCategories>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete vehicle-categories' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
