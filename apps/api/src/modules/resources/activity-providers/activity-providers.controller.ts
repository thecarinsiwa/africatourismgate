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
import { ActivityProvidersListQueryDto } from './dto/activity-providers-list-query.dto';
import { CreateActivityProviderDto } from './dto/create-activity-provider.dto';
import { UpdateActivityProviderDto } from './dto/update-activity-provider.dto';
import { ActivityProvidersService } from './activity-providers.service';

@ApiTags('activity-providers')
@Controller('activity-providers')
export class ActivityProvidersController {
  constructor(private readonly service: ActivityProvidersService) {}

  @Get()
  @ApiOperation({ summary: 'List activity providers' })
  findAll(@Query() query: ActivityProvidersListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get activity provider by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create activity provider' })
  create(@Body() dto: CreateActivityProviderDto) {
    return this.service.createProvider(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update activity provider' })
  update(@Param('id') id: string, @Body() dto: UpdateActivityProviderDto) {
    return this.service.updateProvider(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete activity provider' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
