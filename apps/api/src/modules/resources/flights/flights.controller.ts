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
import { CreateFlightDto } from './dto/create-flight.dto';
import { FlightsListQueryDto } from './dto/flights-list-query.dto';
import { UpdateFlightDto } from './dto/update-flight.dto';
import { FlightsService } from './flights.service';

@ApiTags('flights')
@Controller('flights')
export class FlightsController {
  constructor(private readonly service: FlightsService) {}

  @Get()
  @ApiOperation({ summary: 'List flights' })
  findAll(@Query() query: FlightsListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get flight by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create flight' })
  create(@Body() dto: CreateFlightDto) {
    return this.service.createFlight(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update flight' })
  update(@Param('id') id: string, @Body() dto: UpdateFlightDto) {
    return this.service.updateFlight(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete flight' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
