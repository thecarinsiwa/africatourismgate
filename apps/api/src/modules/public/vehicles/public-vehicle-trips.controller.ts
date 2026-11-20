import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../auth/decorators/public.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import {
  CreateVehicleTripDto,
  JoinVehicleTripDto,
  UpdateVehicleTripDto,
  VehicleTripsListQueryDto,
} from './dto/vehicle-trip.dto';
import { PublicVehicleTripsService } from './public-vehicle-trips.service';

@ApiTags('public')
@Controller('public')
export class PublicVehicleTripsController {
  constructor(private readonly service: PublicVehicleTripsService) {}

  @Public()
  @Get('vehicle-trips')
  @ApiOperation({
    summary: 'List shared vehicle trips (open by default)',
  })
  list(@Query() query: VehicleTripsListQueryDto) {
    return this.service.list(query);
  }

  @Public()
  @Get('vehicle-trips/:id')
  @ApiOperation({ summary: 'Get a shared vehicle trip by id' })
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getById(id);
  }

  @Post('vehicle-trips')
  @ApiOperation({
    summary: 'Create a shared trip (first booker sets departure time)',
  })
  create(
    @Body() dto: CreateVehicleTripDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.create(dto, user.id);
  }

  @Post('vehicle-trips/:id/join')
  @ApiOperation({ summary: 'Join an open shared trip (reserve seats)' })
  join(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: JoinVehicleTripDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.join(id, dto, user.id);
  }

  @Patch('vehicle-trips/:id')
  @ApiOperation({
    summary: 'Update departure time (first booker only, per org rules)',
  })
  updateDeparture(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVehicleTripDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.updateDeparture(id, dto, user.id);
  }
}
