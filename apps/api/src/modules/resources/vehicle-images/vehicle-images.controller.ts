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
import { VehicleImages } from '../../../entities/generated';
import { VehicleImagesListQueryDto } from './dto/vehicle-images-list-query.dto';
import { VehicleImagesService } from './vehicle-images.service';

@ApiTags('vehicle-images')
@Controller('vehicle-images')
export class VehicleImagesController {
  constructor(private readonly service: VehicleImagesService) {}

  @Get()
  @ApiOperation({ summary: 'List vehicle-images' })
  findAll(@Query() query: VehicleImagesListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vehicle-images by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create vehicle-images' })
  create(@Body() dto: DeepPartial<VehicleImages>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update vehicle-images' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<VehicleImages>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete vehicle-images' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
