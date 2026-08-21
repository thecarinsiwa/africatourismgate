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
import { DeepPartial } from 'typeorm';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { PackageImages } from '../../../entities/generated';
import { PackageImagesListQueryDto } from './dto/package-images-list-query.dto';
import { PackageImagesService } from './package-images.service';

@ApiTags('package-images')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('package-images')
export class PackageImagesController {
  constructor(private readonly service: PackageImagesService) {}

  @RequirePermissions('packages.read')
  @Get()
  @ApiOperation({ summary: 'List package images' })
  findAll(@Query() query: PackageImagesListQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('packages.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get package image by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('packages.write')
  @Post()
  @ApiOperation({ summary: 'Create package image' })
  create(@Body() dto: DeepPartial<PackageImages>) {
    return this.service.create(dto);
  }

  @RequirePermissions('packages.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update package image' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<PackageImages>) {
    return this.service.update(id, dto);
  }

  @RequirePermissions('packages.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete package image' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
