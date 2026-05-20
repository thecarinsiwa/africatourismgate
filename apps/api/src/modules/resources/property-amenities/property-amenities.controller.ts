import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PropertyAmenitiesListQueryDto } from './dto/property-amenities-list-query.dto';
import { ReplacePropertyAmenitiesDto } from './dto/replace-property-amenities.dto';
import { PropertyAmenitiesService } from './property-amenities.service';

@ApiTags('property-amenities')
@Controller('property-amenities')
export class PropertyAmenitiesController {
  constructor(private readonly service: PropertyAmenitiesService) {}

  @Get()
  @ApiOperation({ summary: 'List property amenities' })
  findAll(@Query() query: PropertyAmenitiesListQueryDto) {
    return this.service.findAll(query);
  }

  @Put('sync')
  @ApiOperation({ summary: 'Replace property amenities (multi-select sync)' })
  sync(@Body() dto: ReplacePropertyAmenitiesDto) {
    return this.service.replace(dto);
  }

  @Post()
  @ApiOperation({ summary: 'Link amenity to property' })
  create(@Body() dto: { propertyId: string; amenityId: string }) {
    return this.service.create(dto);
  }

  @Delete(':propertyId/:amenityId')
  @ApiOperation({ summary: 'Soft-delete property amenity link' })
  remove(
    @Param('propertyId') propertyId: string,
    @Param('amenityId') amenityId: string,
  ) {
    return this.service.remove(propertyId, amenityId);
  }
}
