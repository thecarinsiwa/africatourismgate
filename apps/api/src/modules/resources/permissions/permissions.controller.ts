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
import { Permissions } from '../../../entities/generated';
import { PermissionsListQueryDto } from './dto/permissions-list-query.dto';
import { PermissionsService } from './permissions.service';

@ApiTags('permissions')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly service: PermissionsService) {}

  @Get()
  @ApiOperation({ summary: 'List permissions' })
  findAll(@Query() query: PermissionsListQueryDto) {
    return this.service.list(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get permissions by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOneDto(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create permissions' })
  create(@Body() dto: DeepPartial<Permissions>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update permissions' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<Permissions>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete permissions' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
