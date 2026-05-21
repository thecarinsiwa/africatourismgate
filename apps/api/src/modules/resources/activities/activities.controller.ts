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
import { ActivitiesListQueryDto } from './dto/activities-list-query.dto';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { ActivitiesService } from './activities.service';

@ApiTags('activities')
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly service: ActivitiesService) {}

  @Get()
  @ApiOperation({ summary: 'List activities' })
  findAll(@Query() query: ActivitiesListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get activity by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create activity' })
  create(@Body() dto: CreateActivityDto) {
    return this.service.createActivity(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update activity' })
  update(@Param('id') id: string, @Body() dto: UpdateActivityDto) {
    return this.service.updateActivity(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete activity' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
