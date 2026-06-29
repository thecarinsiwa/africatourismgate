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
import { CreateVehicleAvailabilityDto } from './dto/create-vehicle-availability.dto';
import { UpdateVehicleAvailabilityDto } from './dto/update-vehicle-availability.dto';
import { VehicleAvailabilityListQueryDto } from './dto/vehicle-availability-list-query.dto';
import { VehicleAvailabilityService } from './vehicle-availability.service';

@ApiTags('vehicle-availability')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('vehicle-availability')
export class VehicleAvailabilityController {
  constructor(private readonly service: VehicleAvailabilityService) {}

  @RequirePermissions('vehicles.read')
  @Get()
  @ApiOperation({ summary: 'List vehicle-availability' })
  findAll(@Query() query: VehicleAvailabilityListQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('vehicles.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get vehicle-availability by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('vehicles.write')
  @Post()
  @ApiOperation({ summary: 'Create vehicle-availability' })
  create(@Body() dto: CreateVehicleAvailabilityDto) {
    return this.service.createAvailability(dto);
  }

  @RequirePermissions('vehicles.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update vehicle-availability' })
  update(@Param('id') id: string, @Body() dto: UpdateVehicleAvailabilityDto) {
    return this.service.updateAvailability(id, dto);
  }

  @RequirePermissions('vehicles.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete vehicle-availability' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
