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
import { Destinations } from '../../../entities/generated';
import { DestinationsService } from './destinations.service';

@ApiTags('destinations')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('destinations')
export class DestinationsController {
  constructor(private readonly service: DestinationsService) {}

  @RequirePermissions('destinations.read')
  @Get()
  @ApiOperation({ summary: 'List destinations' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('destinations.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get destinations by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('destinations.write')
  @Post()
  @ApiOperation({ summary: 'Create destinations' })
  create(@Body() dto: DeepPartial<Destinations>) {
    return this.service.create(dto);
  }

  @RequirePermissions('destinations.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update destinations' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<Destinations>) {
    return this.service.update(id, dto);
  }

  @RequirePermissions('destinations.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete destinations' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
