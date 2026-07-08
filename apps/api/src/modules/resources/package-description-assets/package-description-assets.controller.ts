import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiForbiddenResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { CreatePackageDescriptionAssetDto } from './dto/create-package-description-asset.dto';
import { PackageDescriptionAssetsListQueryDto } from './dto/package-description-assets-list-query.dto';
import { UpdatePackageDescriptionAssetDto } from './dto/update-package-description-asset.dto';
import { PackageDescriptionAssetsService } from './package-description-assets.service';

@ApiTags('package-description-assets')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('package-description-assets')
export class PackageDescriptionAssetsController {
  constructor(private readonly service: PackageDescriptionAssetsService) {}

  @RequirePermissions('packages.read')
  @Get()
  @ApiOperation({ summary: 'List package description assets' })
  findAll(@Query() query: PackageDescriptionAssetsListQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('packages.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get package description asset by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('packages.write')
  @Post()
  @ApiOperation({ summary: 'Create package description asset' })
  create(@Body() dto: CreatePackageDescriptionAssetDto) {
    return this.service.create(dto);
  }

  @RequirePermissions('packages.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update package description asset' })
  update(@Param('id') id: string, @Body() dto: UpdatePackageDescriptionAssetDto) {
    return this.service.update(id, dto);
  }

  @RequirePermissions('packages.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete package description asset' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
