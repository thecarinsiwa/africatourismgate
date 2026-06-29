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
import { Amenities } from '../../../entities/generated';
import { AmenitiesService } from './amenities.service';

@ApiTags('amenities')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('amenities')
export class AmenitiesController {
  constructor(private readonly service: AmenitiesService) {}

  @RequirePermissions('amenities.read')
  @Get()
  @ApiOperation({ summary: 'List amenities' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('amenities.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get amenities by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('amenities.write')
  @Post()
  @ApiOperation({ summary: 'Create amenities' })
  create(@Body() dto: DeepPartial<Amenities>) {
    return this.service.create(dto);
  }

  @RequirePermissions('amenities.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update amenities' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<Amenities>) {
    return this.service.update(id, dto);
  }

  @RequirePermissions('amenities.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete amenities' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
