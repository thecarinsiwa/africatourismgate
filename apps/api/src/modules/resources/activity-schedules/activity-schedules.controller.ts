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
import { ActivitySchedules } from '../../../entities/generated';
import { ActivitySchedulesService } from './activity-schedules.service';

@ApiTags('activity-schedules')
@Controller('activity-schedules')
export class ActivitySchedulesController {
  constructor(private readonly service: ActivitySchedulesService) {}

  @Get()
  @ApiOperation({ summary: 'List activity-schedules' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get activity-schedules by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create activity-schedules' })
  create(@Body() dto: DeepPartial<ActivitySchedules>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update activity-schedules' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<ActivitySchedules>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete activity-schedules' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
