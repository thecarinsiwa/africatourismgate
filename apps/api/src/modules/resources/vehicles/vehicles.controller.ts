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
import { Vehicles } from '../../../entities/generated';
import { VehiclesListQueryDto } from './dto/vehicles-list-query.dto';
import { VehiclesService } from './vehicles.service';

@ApiTags('vehicles')
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly service: VehiclesService) {}

  @Get()
  @ApiOperation({ summary: 'List vehicles' })
  findAll(@Query() query: VehiclesListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vehicles by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create vehicles' })
  create(@Body() dto: DeepPartial<Vehicles>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update vehicles' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<Vehicles>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete vehicles' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
