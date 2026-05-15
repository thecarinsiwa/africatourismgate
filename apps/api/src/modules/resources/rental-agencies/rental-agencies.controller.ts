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
import { RentalAgencies } from '../../../entities/generated';
import { RentalAgenciesService } from './rental-agencies.service';

@ApiTags('rental-agencies')
@Controller('rental-agencies')
export class RentalAgenciesController {
  constructor(private readonly service: RentalAgenciesService) {}

  @Get()
  @ApiOperation({ summary: 'List rental-agencies' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get rental-agencies by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create rental-agencies' })
  create(@Body() dto: DeepPartial<RentalAgencies>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update rental-agencies' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<RentalAgencies>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete rental-agencies' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
