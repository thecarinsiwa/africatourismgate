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
import { ItineraryPorts } from '../../../entities/generated';
import { ItineraryPortsService } from './itinerary-ports.service';

@ApiTags('itinerary-ports')
@Controller('itinerary-ports')
export class ItineraryPortsController {
  constructor(private readonly service: ItineraryPortsService) {}

  @Get()
  @ApiOperation({ summary: 'List itinerary-ports' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get itinerary-ports by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create itinerary-ports' })
  create(@Body() dto: DeepPartial<ItineraryPorts>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update itinerary-ports' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<ItineraryPorts>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete itinerary-ports' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
