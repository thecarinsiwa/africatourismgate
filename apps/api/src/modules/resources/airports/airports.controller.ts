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
import { CreateAirportDto } from './dto/create-airport.dto';
import { AirportsListQueryDto } from './dto/airports-list-query.dto';
import { UpdateAirportDto } from './dto/update-airport.dto';
import { AirportsService } from './airports.service';

@ApiTags('airports')
@Controller('airports')
export class AirportsController {
  constructor(private readonly service: AirportsService) {}

  @Get()
  @ApiOperation({ summary: 'List airports' })
  findAll(@Query() query: AirportsListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get airport by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create airport' })
  create(@Body() dto: CreateAirportDto) {
    return this.service.createAirport(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update airport' })
  update(@Param('id') id: string, @Body() dto: UpdateAirportDto) {
    return this.service.updateAirport(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete airport' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
