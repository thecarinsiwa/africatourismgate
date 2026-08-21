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
import { CruisePorts } from '../../../entities/generated';
import { CruisePortsListQueryDto } from './dto/cruise-ports-list-query.dto';
import { CruisePortsService } from './cruise-ports.service';

@ApiTags('cruise-ports')
@Controller('cruise-ports')
export class CruisePortsController {
  constructor(private readonly service: CruisePortsService) {}

  @Get()
  @ApiOperation({ summary: 'List cruise-ports' })
  findAll(@Query() query: CruisePortsListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get cruise-ports by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create cruise-ports' })
  create(@Body() dto: DeepPartial<CruisePorts>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update cruise-ports' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<CruisePorts>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete cruise-ports' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
