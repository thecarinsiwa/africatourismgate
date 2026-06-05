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
import { CabinAvailability } from '../../../entities/generated';
import { CabinAvailabilityService } from './cabin-availability.service';

@ApiTags('cabin-availability')
@Controller('cabin-availability')
export class CabinAvailabilityController {
  constructor(private readonly service: CabinAvailabilityService) {}

  @Get()
  @ApiOperation({ summary: 'List cabin-availability' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get cabin-availability by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create cabin-availability' })
  create(@Body() dto: DeepPartial<CabinAvailability>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update cabin-availability' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<CabinAvailability>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete cabin-availability' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
