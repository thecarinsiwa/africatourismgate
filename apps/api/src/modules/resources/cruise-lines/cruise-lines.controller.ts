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
import { CruiseLines } from '../../../entities/generated';
import { CruiseLinesService } from './cruise-lines.service';

@ApiTags('cruise-lines')
@Controller('cruise-lines')
export class CruiseLinesController {
  constructor(private readonly service: CruiseLinesService) {}

  @Get()
  @ApiOperation({ summary: 'List cruise-lines' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get cruise-lines by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create cruise-lines' })
  create(@Body() dto: DeepPartial<CruiseLines>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update cruise-lines' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<CruiseLines>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete cruise-lines' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
