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
import { ActivitySchedules } from '../../../entities/generated';
import { ActivitySchedulesListQueryDto } from './dto/activity-schedules-list-query.dto';
import { ActivitySchedulesService } from './activity-schedules.service';

@ApiTags('activity-schedules')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('activity-schedules')
export class ActivitySchedulesController {
  constructor(private readonly service: ActivitySchedulesService) {}

  @RequirePermissions('activities.read')
  @Get()
  @ApiOperation({ summary: 'List activity schedules' })
  findAll(@Query() query: ActivitySchedulesListQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('activities.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get activity schedule by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('activities.write')
  @Post()
  @ApiOperation({ summary: 'Create activity schedule' })
  create(@Body() dto: DeepPartial<ActivitySchedules>) {
    return this.service.create(dto);
  }

  @RequirePermissions('activities.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update activity schedule' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<ActivitySchedules>) {
    return this.service.update(id, dto);
  }

  @RequirePermissions('activities.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete activity schedule' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
