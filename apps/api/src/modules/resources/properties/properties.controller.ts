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
import { Properties } from '../../../entities/generated';
import { PropertiesService } from './properties.service';

@ApiTags('properties')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('properties')
export class PropertiesController {
  constructor(private readonly service: PropertiesService) {}

  @RequirePermissions('properties.read')
  @Get()
  @ApiOperation({ summary: 'List properties' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('properties.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get properties by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('properties.write')
  @Post()
  @ApiOperation({ summary: 'Create properties' })
  create(@Body() dto: DeepPartial<Properties>) {
    return this.service.create(dto);
  }

  @RequirePermissions('properties.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update properties' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<Properties>) {
    return this.service.update(id, dto);
  }

  @RequirePermissions('properties.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete properties' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
