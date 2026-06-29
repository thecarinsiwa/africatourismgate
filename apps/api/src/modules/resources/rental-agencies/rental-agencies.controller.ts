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
import { RentalAgencies } from '../../../entities/generated';
import { RentalAgenciesService } from './rental-agencies.service';

@ApiTags('rental-agencies')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('rental-agencies')
export class RentalAgenciesController {
  constructor(private readonly service: RentalAgenciesService) {}

  @RequirePermissions('vehicles.read')
  @Get()
  @ApiOperation({ summary: 'List rental-agencies' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('vehicles.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get rental-agencies by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('vehicles.write')
  @Post()
  @ApiOperation({ summary: 'Create rental-agencies' })
  create(@Body() dto: DeepPartial<RentalAgencies>) {
    return this.service.create(dto);
  }

  @RequirePermissions('vehicles.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update rental-agencies' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<RentalAgencies>) {
    return this.service.update(id, dto);
  }

  @RequirePermissions('vehicles.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete rental-agencies' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
