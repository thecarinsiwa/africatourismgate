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
import { Itineraries } from '../../../entities/generated';
import { ItinerariesService } from './itineraries.service';

@ApiTags('itineraries')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('itineraries')
export class ItinerariesController {
  constructor(private readonly service: ItinerariesService) {}

  @RequirePermissions('cruises.read')
  @Get()
  @ApiOperation({ summary: 'List itineraries' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('cruises.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get itineraries by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('cruises.write')
  @Post()
  @ApiOperation({ summary: 'Create itineraries' })
  create(@Body() dto: DeepPartial<Itineraries>) {
    return this.service.create(dto);
  }

  @RequirePermissions('cruises.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update itineraries' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<Itineraries>) {
    return this.service.update(id, dto);
  }

  @RequirePermissions('cruises.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete itineraries' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
