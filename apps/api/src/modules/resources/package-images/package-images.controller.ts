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
import { PackageImages } from '../../../entities/generated';
import { PackageImagesService } from './package-images.service';

@ApiTags('package-images')
@Controller('package-images')
export class PackageImagesController {
  constructor(private readonly service: PackageImagesService) {}

  @Get()
  @ApiOperation({ summary: 'List package-images' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get package-images by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create package-images' })
  create(@Body() dto: DeepPartial<PackageImages>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update package-images' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<PackageImages>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete package-images' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
