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
import { ItineraryPorts } from '../../../entities/generated';
import { ItineraryPortsService } from './itinerary-ports.service';

@ApiTags('itinerary-ports')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('itinerary-ports')
export class ItineraryPortsController {
  constructor(private readonly service: ItineraryPortsService) {}

  @RequirePermissions('cruises.read')
  @Get()
  @ApiOperation({ summary: 'List itinerary-ports' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('cruises.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get itinerary-ports by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('cruises.write')
  @Post()
  @ApiOperation({ summary: 'Create itinerary-ports' })
  create(@Body() dto: DeepPartial<ItineraryPorts>) {
    return this.service.create(dto);
  }

  @RequirePermissions('cruises.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update itinerary-ports' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<ItineraryPorts>) {
    return this.service.update(id, dto);
  }

  @RequirePermissions('cruises.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete itinerary-ports' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
