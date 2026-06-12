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
import { ApiForbiddenResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { DeepPartial } from 'typeorm';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { PropertyImages } from '../../../entities/generated';
import { PropertyImagesService } from './property-images.service';

@ApiTags('property-images')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('property-images')
export class PropertyImagesController {
  constructor(private readonly service: PropertyImagesService) {}

  @RequirePermissions('properties.read')
  @Get()
  @ApiOperation({ summary: 'List property-images' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('properties.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get property-images by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('properties.write')
  @Post()
  @ApiOperation({ summary: 'Create property-images' })
  create(@Body() dto: DeepPartial<PropertyImages>) {
    return this.service.create(dto);
  }

  @RequirePermissions('properties.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update property-images' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<PropertyImages>) {
    return this.service.update(id, dto);
  }

  @RequirePermissions('properties.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete property-images' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
