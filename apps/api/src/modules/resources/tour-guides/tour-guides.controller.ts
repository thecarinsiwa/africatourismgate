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
import { TourGuides } from '../../../entities/generated';
import { TourGuidesService } from './tour-guides.service';

@ApiTags('tour-guides')
@Controller('tour-guides')
export class TourGuidesController {
  constructor(private readonly service: TourGuidesService) {}

  @Get()
  @ApiOperation({ summary: 'List tour-guides' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tour-guides by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create tour-guides' })
  create(@Body() dto: DeepPartial<TourGuides>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update tour-guides' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<TourGuides>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete tour-guides' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
