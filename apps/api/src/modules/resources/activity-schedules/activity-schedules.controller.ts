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
import { ActivitySchedulesListQueryDto } from './dto/activity-schedules-list-query.dto';
import { CreateActivityScheduleDto } from './dto/create-activity-schedule.dto';
import { UpdateActivityScheduleDto } from './dto/update-activity-schedule.dto';
import { ActivitySchedulesService } from './activity-schedules.service';

@ApiTags('activity-schedules')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('activity-schedules')
export class ActivitySchedulesController {
  constructor(private readonly service: ActivitySchedulesService) {}

  @RequirePermissions('activities.read')
  @Get()
  @ApiOperation({ summary: 'List activity-schedules' })
  findAll(@Query() query: ActivitySchedulesListQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('activities.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get activity-schedules by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('activities.write')
  @Post()
  @ApiOperation({ summary: 'Create activity-schedules' })
  create(@Body() dto: CreateActivityScheduleDto) {
    return this.service.create(dto);
  }

  @RequirePermissions('activities.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update activity-schedules' })
  update(@Param('id') id: string, @Body() dto: UpdateActivityScheduleDto) {
    return this.service.update(id, dto);
  }

  @RequirePermissions('activities.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete activity-schedules' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
