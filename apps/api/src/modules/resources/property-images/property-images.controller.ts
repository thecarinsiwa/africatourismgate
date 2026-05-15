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
import { PropertyImages } from '../../../entities/generated';
import { PropertyImagesService } from './property-images.service';

@ApiTags('property-images')
@Controller('property-images')
export class PropertyImagesController {
  constructor(private readonly service: PropertyImagesService) {}

  @Get()
  @ApiOperation({ summary: 'List property-images' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get property-images by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create property-images' })
  create(@Body() dto: DeepPartial<PropertyImages>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update property-images' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<PropertyImages>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete property-images' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
