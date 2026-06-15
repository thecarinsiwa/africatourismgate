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
import { CreateDestinationDto } from './dto/create-destination.dto';
import { DestinationRelatedCountsDto } from './dto/destination-related-counts.dto';
import { DestinationsListQueryDto } from './dto/destinations-list-query.dto';
import { UpdateDestinationDto } from './dto/update-destination.dto';
import { DestinationsService } from './destinations.service';

@ApiTags('destinations')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('destinations')
export class DestinationsController {
  constructor(private readonly service: DestinationsService) {}

  @RequirePermissions('destinations.read')
  @Get()
  @ApiOperation({ summary: 'List destinations' })
  findAll(@Query() query: DestinationsListQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('destinations.read')
  @Get(':id/related-counts')
  @ApiOperation({ summary: 'Count properties, activities and packages linked to a destination' })
  getRelatedCounts(@Param('id') id: string): Promise<DestinationRelatedCountsDto> {
    return this.service.getRelatedCounts(id);
  }

  @RequirePermissions('destinations.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get destinations by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('destinations.write')
  @Post()
  @ApiOperation({ summary: 'Create destinations' })
  create(@Body() dto: CreateDestinationDto) {
    return this.service.create(dto);
  }

  @RequirePermissions('destinations.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update destinations' })
  update(@Param('id') id: string, @Body() dto: UpdateDestinationDto) {
    return this.service.update(id, dto);
  }

  @RequirePermissions('destinations.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete destinations' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
