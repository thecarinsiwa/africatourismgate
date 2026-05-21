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
import { CreateCruisePortDto } from './dto/create-cruise-port.dto';
import { CruisePortsListQueryDto } from './dto/cruise-ports-list-query.dto';
import { UpdateCruisePortDto } from './dto/update-cruise-port.dto';
import { CruisePortsService } from './cruise-ports.service';

@ApiTags('cruise-ports')
@Controller('cruise-ports')
export class CruisePortsController {
  constructor(private readonly service: CruisePortsService) {}

  @Get()
  @ApiOperation({ summary: 'List cruise ports' })
  findAll(@Query() query: CruisePortsListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get cruise port by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create cruise port' })
  create(@Body() dto: CreateCruisePortDto) {
    return this.service.createCruisePort(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update cruise port' })
  update(@Param('id') id: string, @Body() dto: UpdateCruisePortDto) {
    return this.service.updateCruisePort(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete cruise port' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
