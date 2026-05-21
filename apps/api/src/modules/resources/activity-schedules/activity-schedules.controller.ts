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
import { ActivitySchedulesListQueryDto } from './dto/activity-schedules-list-query.dto';
import { CreateActivityScheduleDto } from './dto/create-activity-schedule.dto';
import { UpdateActivityScheduleDto } from './dto/update-activity-schedule.dto';
import { ActivitySchedulesService } from './activity-schedules.service';

@ApiTags('activity-schedules')
@Controller('activity-schedules')
export class ActivitySchedulesController {
  constructor(private readonly service: ActivitySchedulesService) {}

  @Get()
  @ApiOperation({ summary: 'List activity schedules' })
  findAll(@Query() query: ActivitySchedulesListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get activity schedule by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create activity schedule' })
  create(@Body() dto: CreateActivityScheduleDto) {
    return this.service.createSchedule(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update activity schedule' })
  update(@Param('id') id: string, @Body() dto: UpdateActivityScheduleDto) {
    return this.service.updateSchedule(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete activity schedule' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
