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
import { ActivityItineraryStopsListQueryDto } from './dto/activity-itinerary-stops-list-query.dto';
import { CreateActivityItineraryStopDto } from './dto/create-activity-itinerary-stop.dto';
import { UpdateActivityItineraryStopDto } from './dto/update-activity-itinerary-stop.dto';
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
  create(@Body() dto: CreateActivityItineraryStopDto) {
    return this.service.createFromDto(dto);
  }

  @RequirePermissions('activities.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update activity itinerary stop' })
  update(@Param('id') id: string, @Body() dto: UpdateActivityItineraryStopDto) {
    return this.service.updateFromDto(id, dto);
  }

  @RequirePermissions('activities.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete activity itinerary stop' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
