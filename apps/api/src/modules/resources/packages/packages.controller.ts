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
import { Packages } from '../../../entities/generated';
import { PackagesService } from './packages.service';

@ApiTags('packages')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('packages')
export class PackagesController {
  constructor(private readonly service: PackagesService) {}

  @RequirePermissions('packages.read')
  @Get()
  @ApiOperation({ summary: 'List packages' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('packages.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get packages by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('packages.write')
  @Post()
  @ApiOperation({ summary: 'Create packages' })
  create(@Body() dto: DeepPartial<Packages>) {
    return this.service.create(dto);
  }

  @RequirePermissions('packages.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update packages' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<Packages>) {
    return this.service.update(id, dto);
  }

  @RequirePermissions('packages.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete packages' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
