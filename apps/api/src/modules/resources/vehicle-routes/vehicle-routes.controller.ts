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
import { CreateVehicleRouteDto } from './dto/create-vehicle-route.dto';
import { UpdateVehicleRouteDto } from './dto/update-vehicle-route.dto';
import { VehicleRoutesListQueryDto } from './dto/vehicle-routes-list-query.dto';
import { VehicleRoutesService } from './vehicle-routes.service';

@ApiTags('vehicle-routes')
@Controller('vehicle-routes')
export class VehicleRoutesController {
  constructor(private readonly service: VehicleRoutesService) {}

  @Get()
  @ApiOperation({ summary: 'List vehicle routes (tronçons)' })
  findAll(@Query() query: VehicleRoutesListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vehicle route by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create vehicle route (tronçon)' })
  create(@Body() dto: CreateVehicleRouteDto) {
    return this.service.createRoute(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update vehicle route' })
  update(@Param('id') id: string, @Body() dto: UpdateVehicleRouteDto) {
    return this.service.updateRoute(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete vehicle route' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
