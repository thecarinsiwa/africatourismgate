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
import { ActivityProviders } from '../../../entities/generated';
import { ActivityProvidersService } from './activity-providers.service';

@ApiTags('activity-providers')
@Controller('activity-providers')
export class ActivityProvidersController {
  constructor(private readonly service: ActivityProvidersService) {}

  @Get()
  @ApiOperation({ summary: 'List activity-providers' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get activity-providers by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create activity-providers' })
  create(@Body() dto: DeepPartial<ActivityProviders>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update activity-providers' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<ActivityProviders>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete activity-providers' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
