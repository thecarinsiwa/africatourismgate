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
import { CruiseSailings } from '../../../entities/generated';
import { CruiseSailingsService } from './cruise-sailings.service';

@ApiTags('cruise-sailings')
@Controller('cruise-sailings')
export class CruiseSailingsController {
  constructor(private readonly service: CruiseSailingsService) {}

  @Get()
  @ApiOperation({ summary: 'List cruise-sailings' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get cruise-sailings by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create cruise-sailings' })
  create(@Body() dto: DeepPartial<CruiseSailings>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update cruise-sailings' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<CruiseSailings>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete cruise-sailings' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
