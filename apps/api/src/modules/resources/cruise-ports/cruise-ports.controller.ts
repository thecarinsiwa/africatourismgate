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
import { CruisePorts } from '../../../entities/generated';
import { CruisePortsService } from './cruise-ports.service';

@ApiTags('cruise-ports')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('cruise-ports')
export class CruisePortsController {
  constructor(private readonly service: CruisePortsService) {}

  @RequirePermissions('cruises.read')
  @Get()
  @ApiOperation({ summary: 'List cruise-ports' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('cruises.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get cruise-ports by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('cruises.write')
  @Post()
  @ApiOperation({ summary: 'Create cruise-ports' })
  create(@Body() dto: DeepPartial<CruisePorts>) {
    return this.service.create(dto);
  }

  @RequirePermissions('cruises.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update cruise-ports' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<CruisePorts>) {
    return this.service.update(id, dto);
  }

  @RequirePermissions('cruises.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete cruise-ports' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
