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
import { CreateItineraryPortDto } from './dto/create-itinerary-port.dto';
import { ItineraryPortsListQueryDto } from './dto/itinerary-ports-list-query.dto';
import { UpdateItineraryPortDto } from './dto/update-itinerary-port.dto';
import { ItineraryPortsService } from './itinerary-ports.service';

@ApiTags('itinerary-ports')
@Controller('itinerary-ports')
export class ItineraryPortsController {
  constructor(private readonly service: ItineraryPortsService) {}

  @Get()
  @ApiOperation({ summary: 'List itinerary ports' })
  findAll(@Query() query: ItineraryPortsListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get itinerary port by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create itinerary port' })
  create(@Body() dto: CreateItineraryPortDto) {
    return this.service.createItineraryPort(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update itinerary port' })
  update(@Param('id') id: string, @Body() dto: UpdateItineraryPortDto) {
    return this.service.updateItineraryPort(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete itinerary port' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
