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
import { Airports } from '../../../entities/generated';
import { AirportsService } from './airports.service';

@ApiTags('airports')
@Controller('airports')
export class AirportsController {
  constructor(private readonly service: AirportsService) {}

  @Get()
  @ApiOperation({ summary: 'List airports' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get airports by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create airports' })
  create(@Body() dto: DeepPartial<Airports>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update airports' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<Airports>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete airports' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
