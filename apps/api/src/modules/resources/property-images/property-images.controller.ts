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
import { CreatePropertyImageDto } from './dto/create-property-image.dto';
import { PropertyImagesListQueryDto } from './dto/property-images-list-query.dto';
import { UpdatePropertyImageDto } from './dto/update-property-image.dto';
import { PropertyImagesService } from './property-images.service';

@ApiTags('property-images')
@Controller('property-images')
export class PropertyImagesController {
  constructor(private readonly service: PropertyImagesService) {}

  @Get()
  @ApiOperation({ summary: 'List property images' })
  findAll(@Query() query: PropertyImagesListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get property image by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create property image' })
  create(@Body() dto: CreatePropertyImageDto) {
    return this.service.createImage(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update property image' })
  update(@Param('id') id: string, @Body() dto: UpdatePropertyImageDto) {
    return this.service.updateImage(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete property image' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
