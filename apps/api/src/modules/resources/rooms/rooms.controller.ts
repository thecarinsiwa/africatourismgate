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
import { Rooms } from '../../../entities/generated';
import { RoomsListQueryDto } from './dto/rooms-list-query.dto';
import { RoomsService } from './rooms.service';

@ApiTags('rooms')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('rooms')
export class RoomsController {
  constructor(private readonly service: RoomsService) {}

  @RequirePermissions('properties.read')
  @Get()
  @ApiOperation({ summary: 'List rooms' })
  findAll(@Query() query: RoomsListQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('properties.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get rooms by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('properties.write')
  @Post()
  @ApiOperation({ summary: 'Create rooms' })
  create(@Body() dto: DeepPartial<Rooms>) {
    return this.service.create(dto);
  }

  @RequirePermissions('properties.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update rooms' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<Rooms>) {
    return this.service.update(id, dto);
  }

  @RequirePermissions('properties.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete rooms' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
