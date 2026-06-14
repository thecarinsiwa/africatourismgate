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
import { RoomImages } from '../../../entities/generated';
import { RoomImagesListQueryDto } from './dto/room-images-list-query.dto';
import { RoomImagesService } from './room-images.service';

@ApiTags('room-images')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('room-images')
export class RoomImagesController {
  constructor(private readonly service: RoomImagesService) {}

  @RequirePermissions('properties.read')
  @Get()
  @ApiOperation({ summary: 'List room-images' })
  findAll(@Query() query: RoomImagesListQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('properties.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get room-images by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('properties.write')
  @Post()
  @ApiOperation({ summary: 'Create room-images' })
  create(@Body() dto: DeepPartial<RoomImages>) {
    return this.service.create(dto);
  }

  @RequirePermissions('properties.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update room-images' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<RoomImages>) {
    return this.service.update(id, dto);
  }

  @RequirePermissions('properties.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete room-images' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
