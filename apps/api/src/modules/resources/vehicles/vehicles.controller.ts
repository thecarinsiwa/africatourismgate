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
import { Vehicles } from '../../../entities/generated';
import { VehiclesService } from './vehicles.service';

@ApiTags('vehicles')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly service: VehiclesService) {}

  @RequirePermissions('vehicles.read')
  @Get()
  @ApiOperation({ summary: 'List vehicles' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('vehicles.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get vehicles by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('vehicles.write')
  @Post()
  @ApiOperation({ summary: 'Create vehicles' })
  create(@Body() dto: DeepPartial<Vehicles>) {
    return this.service.create(dto);
  }

  @RequirePermissions('vehicles.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update vehicles' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<Vehicles>) {
    return this.service.update(id, dto);
  }

  @RequirePermissions('vehicles.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete vehicles' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
