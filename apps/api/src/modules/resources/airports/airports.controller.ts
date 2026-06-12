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
import { ApiForbiddenResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { DeepPartial } from 'typeorm';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { Airports } from '../../../entities/generated';
import { AirportsService } from './airports.service';

@ApiTags('airports')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('airports')
export class AirportsController {
  constructor(private readonly service: AirportsService) {}

  @RequirePermissions('flights.read')
  @Get()
  @ApiOperation({ summary: 'List airports' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('flights.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get airports by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('flights.write')
  @Post()
  @ApiOperation({ summary: 'Create airports' })
  create(@Body() dto: DeepPartial<Airports>) {
    return this.service.create(dto);
  }

  @RequirePermissions('flights.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update airports' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<Airports>) {
    return this.service.update(id, dto);
  }

  @RequirePermissions('flights.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete airports' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
