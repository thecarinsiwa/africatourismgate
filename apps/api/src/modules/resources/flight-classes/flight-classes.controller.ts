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
import { CreateFlightClassDto } from './dto/create-flight-class.dto';
import { FlightClassesListQueryDto } from './dto/flight-classes-list-query.dto';
import { UpdateFlightClassDto } from './dto/update-flight-class.dto';
import { FlightClassesService } from './flight-classes.service';

@ApiTags('flight-classes')
@Controller('flight-classes')
export class FlightClassesController {
  constructor(private readonly service: FlightClassesService) {}

  @Get()
  @ApiOperation({ summary: 'List flight classes' })
  findAll(@Query() query: FlightClassesListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get flight class by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create flight class' })
  create(@Body() dto: CreateFlightClassDto) {
    return this.service.createFlightClass(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update flight class' })
  update(@Param('id') id: string, @Body() dto: UpdateFlightClassDto) {
    return this.service.updateFlightClass(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete flight class' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
