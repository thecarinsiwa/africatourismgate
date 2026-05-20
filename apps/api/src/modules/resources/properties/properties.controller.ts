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
import { CreatePropertyDto } from './dto/create-property.dto';
import { PropertiesListQueryDto } from './dto/properties-list-query.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertiesService } from './properties.service';

@ApiTags('properties')
@Controller('properties')
export class PropertiesController {
  constructor(private readonly service: PropertiesService) {}

  @Get()
  @ApiOperation({ summary: 'List properties' })
  findAll(@Query() query: PropertiesListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get property by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create property' })
  create(@Body() dto: CreatePropertyDto) {
    return this.service.createProperty(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update property' })
  update(@Param('id') id: string, @Body() dto: UpdatePropertyDto) {
    return this.service.updateProperty(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete property' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
