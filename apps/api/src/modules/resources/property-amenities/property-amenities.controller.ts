import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiForbiddenResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { PropertyAmenities } from '../../../entities/generated';
import { PropertyAmenitiesListQueryDto } from './dto/property-amenities-list-query.dto';
import { ReplacePropertyAmenitiesDto } from './dto/replace-property-amenities.dto';
import { PropertyAmenitiesService } from './property-amenities.service';

@ApiTags('property-amenities')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('property-amenities')
export class PropertyAmenitiesController {
  constructor(private readonly service: PropertyAmenitiesService) {}

  @RequirePermissions('properties.read')
  @Get()
  @ApiOperation({ summary: 'List property-amenities' })
  findAll(@Query() query: PropertyAmenitiesListQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('properties.write')
  @Put('sync')
  @ApiOperation({ summary: 'Replace property amenities for a property' })
  replace(@Body() dto: ReplacePropertyAmenitiesDto) {
    return this.service.replace(dto.propertyId, dto.amenityIds);
  }

  @RequirePermissions('properties.write')
  @Post()
  @ApiOperation({ summary: 'Create property-amenities' })
  create(@Body() dto: Partial<PropertyAmenities>) {
    return this.service.create(dto);
  }

  @RequirePermissions('properties.write')
  @Delete(':propertyId/:amenityId')
  @ApiOperation({ summary: 'Soft-delete property-amenities' })
  remove(@Param('propertyId') propertyId: string, @Param('amenityId') amenityId: string) {
    return this.service.remove(propertyId, amenityId);
  }
}
