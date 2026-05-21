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
import { CreateItineraryDto } from './dto/create-itinerary.dto';
import { ItinerariesListQueryDto } from './dto/itineraries-list-query.dto';
import { UpdateItineraryDto } from './dto/update-itinerary.dto';
import { ItinerariesService } from './itineraries.service';

@ApiTags('itineraries')
@Controller('itineraries')
export class ItinerariesController {
  constructor(private readonly service: ItinerariesService) {}

  @Get()
  @ApiOperation({ summary: 'List itineraries' })
  findAll(@Query() query: ItinerariesListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get itinerary by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create itinerary' })
  create(@Body() dto: CreateItineraryDto) {
    return this.service.createItinerary(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update itinerary' })
  update(@Param('id') id: string, @Body() dto: UpdateItineraryDto) {
    return this.service.updateItinerary(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete itinerary' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
