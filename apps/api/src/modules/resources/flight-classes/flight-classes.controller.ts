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
import { FlightClasses } from '../../../entities/generated';
import { FlightClassesService } from './flight-classes.service';

@ApiTags('flight-classes')
@Controller('flight-classes')
export class FlightClassesController {
  constructor(private readonly service: FlightClassesService) {}

  @Get()
  @ApiOperation({ summary: 'List flight-classes' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get flight-classes by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create flight-classes' })
  create(@Body() dto: DeepPartial<FlightClasses>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update flight-classes' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<FlightClasses>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete flight-classes' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
