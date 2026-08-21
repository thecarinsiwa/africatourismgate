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
import { ActivityItineraryStops } from '../../../entities/generated';
import { ActivityItineraryStopsListQueryDto } from './dto/activity-itinerary-stops-list-query.dto';
import { ActivityItineraryStopsService } from './activity-itinerary-stops.service';

@ApiTags('activity-itinerary-stops')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('activity-itinerary-stops')
export class ActivityItineraryStopsController {
  constructor(private readonly service: ActivityItineraryStopsService) {}

  @RequirePermissions('activities.read')
  @Get()
  @ApiOperation({ summary: 'List activity itinerary stops' })
  findAll(@Query() query: ActivityItineraryStopsListQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('activities.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get activity itinerary stop by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('activities.write')
  @Post()
  @ApiOperation({ summary: 'Create activity itinerary stop' })
  create(@Body() dto: DeepPartial<ActivityItineraryStops>) {
    return this.service.create(dto);
  }

  @RequirePermissions('activities.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update activity itinerary stop' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<ActivityItineraryStops>) {
    return this.service.update(id, dto);
  }

  @RequirePermissions('activities.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete activity itinerary stop' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
