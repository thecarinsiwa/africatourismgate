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
import { ShipImages } from '../../../entities/generated';
import { ShipImagesService } from './ship-images.service';

@ApiTags('ship-images')
@Controller('ship-images')
export class ShipImagesController {
  constructor(private readonly service: ShipImagesService) {}

  @Get()
  @ApiOperation({ summary: 'List ship-images' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ship-images by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create ship-images' })
  create(@Body() dto: DeepPartial<ShipImages>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update ship-images' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<ShipImages>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete ship-images' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
