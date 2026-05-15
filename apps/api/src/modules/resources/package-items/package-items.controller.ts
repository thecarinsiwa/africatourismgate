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
import { PackageItems } from '../../../entities/generated';
import { PackageItemsService } from './package-items.service';

@ApiTags('package-items')
@Controller('package-items')
export class PackageItemsController {
  constructor(private readonly service: PackageItemsService) {}

  @Get()
  @ApiOperation({ summary: 'List package-items' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get package-items by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create package-items' })
  create(@Body() dto: DeepPartial<PackageItems>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update package-items' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<PackageItems>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete package-items' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
