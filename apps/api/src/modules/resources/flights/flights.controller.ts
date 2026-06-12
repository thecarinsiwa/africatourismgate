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
import { Flights } from '../../../entities/generated';
import { FlightsService } from './flights.service';

@ApiTags('flights')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('flights')
export class FlightsController {
  constructor(private readonly service: FlightsService) {}

  @RequirePermissions('flights.read')
  @Get()
  @ApiOperation({ summary: 'List flights' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('flights.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get flights by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('flights.write')
  @Post()
  @ApiOperation({ summary: 'Create flights' })
  create(@Body() dto: DeepPartial<Flights>) {
    return this.service.create(dto);
  }

  @RequirePermissions('flights.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update flights' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<Flights>) {
    return this.service.update(id, dto);
  }

  @RequirePermissions('flights.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete flights' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
