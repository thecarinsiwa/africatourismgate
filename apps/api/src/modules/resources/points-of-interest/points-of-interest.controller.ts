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
import { PointsOfInterest } from '../../../entities/generated';
import { PointsOfInterestService } from './points-of-interest.service';

@ApiTags('points-of-interest')
@Controller('points-of-interest')
export class PointsOfInterestController {
  constructor(private readonly service: PointsOfInterestService) {}

  @Get()
  @ApiOperation({ summary: 'List points-of-interest' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get points-of-interest by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create points-of-interest' })
  create(@Body() dto: DeepPartial<PointsOfInterest>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update points-of-interest' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<PointsOfInterest>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete points-of-interest' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
