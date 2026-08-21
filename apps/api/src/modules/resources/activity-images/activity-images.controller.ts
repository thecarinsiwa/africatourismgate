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
import { ActivityImages } from '../../../entities/generated';
import { ActivityImagesListQueryDto } from './dto/activity-images-list-query.dto';
import { ActivityImagesService } from './activity-images.service';

@ApiTags('activity-images')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('activity-images')
export class ActivityImagesController {
  constructor(private readonly service: ActivityImagesService) {}

  @RequirePermissions('activities.read')
  @Get()
  @ApiOperation({ summary: 'List activity images' })
  findAll(@Query() query: ActivityImagesListQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('activities.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get activity image by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('activities.write')
  @Post()
  @ApiOperation({ summary: 'Create activity image' })
  create(@Body() dto: DeepPartial<ActivityImages>) {
    return this.service.create(dto);
  }

  @RequirePermissions('activities.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update activity image' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<ActivityImages>) {
    return this.service.update(id, dto);
  }

  @RequirePermissions('activities.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete activity image' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
