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
import { PackageItems } from '../../../entities/generated';
import { PackageItemsListQueryDto } from './dto/package-items-list-query.dto';
import { PackageItemsService } from './package-items.service';

@ApiTags('package-items')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('package-items')
export class PackageItemsController {
  constructor(private readonly service: PackageItemsService) {}

  @RequirePermissions('packages.read')
  @Get()
  @ApiOperation({ summary: 'List package items' })
  findAll(@Query() query: PackageItemsListQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('packages.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get package item by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('packages.write')
  @Post()
  @ApiOperation({ summary: 'Create package item' })
  create(@Body() dto: DeepPartial<PackageItems>) {
    return this.service.create(dto);
  }

  @RequirePermissions('packages.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update package item' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<PackageItems>) {
    return this.service.update(id, dto);
  }

  @RequirePermissions('packages.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete package item' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
