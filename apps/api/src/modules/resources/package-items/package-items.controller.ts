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
import { CreatePackageItemDto } from './dto/create-package-item.dto';
import { PackageItemsListQueryDto } from './dto/package-items-list-query.dto';
import { UpdatePackageItemDto } from './dto/update-package-item.dto';
import { PackageItemsService } from './package-items.service';

@ApiTags('package-items')
@Controller('package-items')
export class PackageItemsController {
  constructor(private readonly service: PackageItemsService) {}

  @Get()
  @ApiOperation({ summary: 'List package items' })
  findAll(@Query() query: PackageItemsListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get package item by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create package item' })
  create(@Body() dto: CreatePackageItemDto) {
    return this.service.createItem(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update package item' })
  update(@Param('id') id: string, @Body() dto: UpdatePackageItemDto) {
    return this.service.updateItem(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete package item' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
