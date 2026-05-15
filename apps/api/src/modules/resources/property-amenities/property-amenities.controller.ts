import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { PropertyAmenities } from '../../../entities/generated';
import { PropertyAmenitiesService } from './property-amenities.service';

@ApiTags('property-amenities')
@Controller('property-amenities')
export class PropertyAmenitiesController {
  constructor(private readonly service: PropertyAmenitiesService) {}

  @Get()
  @ApiOperation({ summary: 'List property-amenities' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create property-amenities' })
  create(@Body() dto: Partial<PropertyAmenities>) {
    return this.service.create(dto);
  }

  @Delete(':propertyId/:amenityId')
  @ApiOperation({ summary: 'Soft-delete property-amenities' })
  remove(@Param("propertyId") propertyId: string, @Param("amenityId") amenityId: string) {
    return this.service.remove(propertyId, amenityId);
  }
}
