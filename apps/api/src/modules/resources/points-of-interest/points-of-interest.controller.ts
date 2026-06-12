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
import { PointsOfInterest } from '../../../entities/generated';
import { PointsOfInterestService } from './points-of-interest.service';

@ApiTags('points-of-interest')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('points-of-interest')
export class PointsOfInterestController {
  constructor(private readonly service: PointsOfInterestService) {}

  @RequirePermissions('destinations.read')
  @Get()
  @ApiOperation({ summary: 'List points-of-interest' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('destinations.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get points-of-interest by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('destinations.write')
  @Post()
  @ApiOperation({ summary: 'Create points-of-interest' })
  create(@Body() dto: DeepPartial<PointsOfInterest>) {
    return this.service.create(dto);
  }

  @RequirePermissions('destinations.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update points-of-interest' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<PointsOfInterest>) {
    return this.service.update(id, dto);
  }

  @RequirePermissions('destinations.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete points-of-interest' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
