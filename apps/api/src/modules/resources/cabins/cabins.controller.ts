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
import { Cabins } from '../../../entities/generated';
import { CabinsService } from './cabins.service';

@ApiTags('cabins')
@Controller('cabins')
export class CabinsController {
  constructor(private readonly service: CabinsService) {}

  @Get()
  @ApiOperation({ summary: 'List cabins' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get cabins by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create cabins' })
  create(@Body() dto: DeepPartial<Cabins>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update cabins' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<Cabins>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete cabins' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
