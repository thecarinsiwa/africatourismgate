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
import { ShipImages } from '../../../entities/generated';
import { ShipImagesListQueryDto } from './dto/ship-images-list-query.dto';
import { ShipImagesService } from './ship-images.service';

@ApiTags('ship-images')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('ship-images')
export class ShipImagesController {
  constructor(private readonly service: ShipImagesService) {}

  @RequirePermissions('cruises.read')
  @Get()
  @ApiOperation({ summary: 'List ship-images' })
  findAll(@Query() query: ShipImagesListQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('cruises.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get ship-images by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('cruises.write')
  @Post()
  @ApiOperation({ summary: 'Create ship-images' })
  create(@Body() dto: DeepPartial<ShipImages>) {
    return this.service.create(dto);
  }

  @RequirePermissions('cruises.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update ship-images' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<ShipImages>) {
    return this.service.update(id, dto);
  }

  @RequirePermissions('cruises.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete ship-images' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
