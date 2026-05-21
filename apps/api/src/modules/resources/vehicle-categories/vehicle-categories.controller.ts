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
import { CreateVehicleCategoryDto } from './dto/create-vehicle-category.dto';
import { VehicleCategoriesListQueryDto } from './dto/vehicle-categories-list-query.dto';
import { UpdateVehicleCategoryDto } from './dto/update-vehicle-category.dto';
import { VehicleCategoriesService } from './vehicle-categories.service';

@ApiTags('vehicle-categories')
@Controller('vehicle-categories')
export class VehicleCategoriesController {
  constructor(private readonly service: VehicleCategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List vehicle categories' })
  findAll(@Query() query: VehicleCategoriesListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vehicle category by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create vehicle category' })
  create(@Body() dto: CreateVehicleCategoryDto) {
    return this.service.createCategory(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update vehicle category' })
  update(@Param('id') id: string, @Body() dto: UpdateVehicleCategoryDto) {
    return this.service.updateCategory(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete vehicle category' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
