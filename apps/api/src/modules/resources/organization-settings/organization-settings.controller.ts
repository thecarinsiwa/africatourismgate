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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DeepPartial } from 'typeorm';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { OrganizationSettings } from '../../../entities/generated';
import { OrganizationSettingsService } from './organization-settings.service';

@ApiTags('organization-settings')
@Controller('organization-settings')
export class OrganizationSettingsController {
  constructor(private readonly service: OrganizationSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'List organization-settings' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get organization-settings by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create organization-settings' })
  create(@Body() dto: DeepPartial<OrganizationSettings>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update organization-settings' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<OrganizationSettings>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete organization-settings' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
