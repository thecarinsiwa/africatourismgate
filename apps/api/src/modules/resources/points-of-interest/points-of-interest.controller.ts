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
import { CreatePointOfInterestDto } from './dto/create-point-of-interest.dto';
import { PointsOfInterestListQueryDto } from './dto/points-of-interest-list-query.dto';
import { UpdatePointOfInterestDto } from './dto/update-point-of-interest.dto';
import { PointsOfInterestService } from './points-of-interest.service';

@ApiTags('points-of-interest')
@Controller('points-of-interest')
export class PointsOfInterestController {
  constructor(private readonly service: PointsOfInterestService) {}

  @Get()
  @ApiOperation({ summary: 'List points-of-interest' })
  findAll(@Query() query: PointsOfInterestListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get points-of-interest by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create points-of-interest' })
  create(@Body() dto: CreatePointOfInterestDto) {
    return this.service.createPoint(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update points-of-interest' })
  update(@Param('id') id: string, @Body() dto: UpdatePointOfInterestDto) {
    return this.service.updatePoint(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete points-of-interest' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
