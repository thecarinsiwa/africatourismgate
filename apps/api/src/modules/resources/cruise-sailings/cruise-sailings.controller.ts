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
import { CruiseSailings } from '../../../entities/generated';
import { CruiseSailingsService } from './cruise-sailings.service';

@ApiTags('cruise-sailings')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('cruise-sailings')
export class CruiseSailingsController {
  constructor(private readonly service: CruiseSailingsService) {}

  @RequirePermissions('cruises.read')
  @Get()
  @ApiOperation({ summary: 'List cruise-sailings' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('cruises.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get cruise-sailings by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('cruises.write')
  @Post()
  @ApiOperation({ summary: 'Create cruise-sailings' })
  create(@Body() dto: DeepPartial<CruiseSailings>) {
    return this.service.create(dto);
  }

  @RequirePermissions('cruises.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update cruise-sailings' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<CruiseSailings>) {
    return this.service.update(id, dto);
  }

  @RequirePermissions('cruises.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete cruise-sailings' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
