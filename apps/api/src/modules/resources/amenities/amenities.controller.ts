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
import { CreateAmenityDto } from './dto/create-amenity.dto';
import { AmenitiesListQueryDto } from './dto/amenities-list-query.dto';
import { UpdateAmenityDto } from './dto/update-amenity.dto';
import { AmenitiesService } from './amenities.service';

@ApiTags('amenities')
@Controller('amenities')
export class AmenitiesController {
  constructor(private readonly service: AmenitiesService) {}

  @Get()
  @ApiOperation({ summary: 'List amenities' })
  findAll(@Query() query: AmenitiesListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get amenity by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create amenity' })
  create(@Body() dto: CreateAmenityDto) {
    return this.service.createAmenity(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update amenity' })
  update(@Param('id') id: string, @Body() dto: UpdateAmenityDto) {
    return this.service.updateAmenity(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete amenity' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
