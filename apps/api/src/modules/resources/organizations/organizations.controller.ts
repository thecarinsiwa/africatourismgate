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
import { DeepPartial } from 'typeorm';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { Organizations } from '../../../entities/generated';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { OrganizationsService } from './organizations.service';

@ApiTags('organizations')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly service: OrganizationsService) {}

  @Get()
  @RequirePermissions('organizations.read')
  @ApiOperation({ summary: 'List organizations' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('organizations.read')
  @ApiOperation({ summary: 'Get organizations by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermissions('organizations.write')
  @ApiOperation({ summary: 'Create organizations' })
  create(@Body() dto: DeepPartial<Organizations>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('organizations.write')
  @ApiOperation({ summary: 'Update organizations' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<Organizations>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('organizations.delete')
  @ApiOperation({ summary: 'Soft-delete organizations' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
