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
import { Organizations } from '../../../entities/generated';
import { OrganizationsListQueryDto } from './dto/organizations-list-query.dto';
import { OrganizationsService } from './organizations.service';

@ApiTags('organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly service: OrganizationsService) {}

  @Get()
  @ApiOperation({ summary: 'List organizations' })
  findAll(@Query() query: OrganizationsListQueryDto) {
    return this.service.findAllWithCounts(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get organizations by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create organizations' })
  create(@Body() dto: DeepPartial<Organizations>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update organizations' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<Organizations>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete organizations' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
