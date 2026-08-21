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
import { Destinations } from '../../../entities/generated';
import { DestinationRelatedCountsDto } from './dto/destination-related-counts.dto';
import { DestinationsListQueryDto } from './dto/destinations-list-query.dto';
import { DestinationsService } from './destinations.service';

@ApiTags('destinations')
@Controller('destinations')
export class DestinationsController {
  constructor(private readonly service: DestinationsService) {}

  @Get()
  @ApiOperation({ summary: 'List destinations' })
  findAll(@Query() query: DestinationsListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id/related-counts')
  @ApiOperation({
    summary: 'Count properties, activities and packages linked to a destination',
  })
  getRelatedCounts(@Param('id') id: string): Promise<DestinationRelatedCountsDto> {
    return this.service.getRelatedCounts(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get destinations by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create destinations' })
  create(@Body() dto: DeepPartial<Destinations>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update destinations' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<Destinations>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete destinations' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
