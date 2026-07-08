import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiForbiddenResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { CreateActivityDescriptionAssetDto } from './dto/create-activity-description-asset.dto';
import { ActivityDescriptionAssetsListQueryDto } from './dto/activity-description-assets-list-query.dto';
import { UpdateActivityDescriptionAssetDto } from './dto/update-activity-description-asset.dto';
import { ActivityDescriptionAssetsService } from './activity-description-assets.service';

@ApiTags('activity-description-assets')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('activity-description-assets')
export class ActivityDescriptionAssetsController {
  constructor(private readonly service: ActivityDescriptionAssetsService) {}

  @RequirePermissions('activities.read')
  @Get()
  @ApiOperation({ summary: 'List activity description assets' })
  findAll(@Query() query: ActivityDescriptionAssetsListQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('activities.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get activity description asset by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('activities.write')
  @Post()
  @ApiOperation({ summary: 'Create activity description asset' })
  create(@Body() dto: CreateActivityDescriptionAssetDto) {
    return this.service.create(dto);
  }

  @RequirePermissions('activities.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update activity description asset' })
  update(@Param('id') id: string, @Body() dto: UpdateActivityDescriptionAssetDto) {
    return this.service.update(id, dto);
  }

  @RequirePermissions('activities.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete activity description asset' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
