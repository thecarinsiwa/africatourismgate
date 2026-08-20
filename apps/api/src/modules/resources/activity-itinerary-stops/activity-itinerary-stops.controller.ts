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
import { ActivityItineraryStops } from '../../../entities/generated';
import { ActivityItineraryStopsService } from './activity-itinerary-stops.service';

@ApiTags('activity-itinerary-stops')
@Controller('activity-itinerary-stops')
export class ActivityItineraryStopsController {
  constructor(private readonly service: ActivityItineraryStopsService) {}

  @Get()
  @ApiOperation({ summary: 'List activity-itinerary-stops' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get activity-itinerary-stops by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create activity-itinerary-stops' })
  create(@Body() dto: DeepPartial<ActivityItineraryStops>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update activity-itinerary-stops' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<ActivityItineraryStops>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete activity-itinerary-stops' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
