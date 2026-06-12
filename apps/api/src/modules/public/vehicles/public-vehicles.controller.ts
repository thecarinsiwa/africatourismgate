import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../auth/decorators/public.decorator';
import { VehicleDetailQueryDto } from './dto/vehicle-detail-query.dto';
import { VehicleSearchQueryDto } from './dto/vehicle-search-query.dto';
import { PublicVehiclesService } from './public-vehicles.service';

@ApiTags('public')
@Controller('public')
export class PublicVehiclesController {
  constructor(private readonly service: PublicVehiclesService) {}

  @Public()
  @Get('vehicles/search')
  @ApiOperation({
    summary: 'Search vehicles by pickup location and rental dates',
  })
  search(@Query() query: VehicleSearchQueryDto) {
    return this.service.search(query);
  }

  @Public()
  @Get('vehicles/:id')
  @ApiOperation({
    summary: 'Vehicle detail with agency, category, and availability slot',
  })
  getById(@Param('id') id: string, @Query() query: VehicleDetailQueryDto) {
    return this.service.getById(id, query);
  }
}
