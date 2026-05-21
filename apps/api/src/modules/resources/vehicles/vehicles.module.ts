import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  RentalAgencies,
  VehicleCategories,
  Vehicles,
} from '../../../entities/generated';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicles, RentalAgencies, VehicleCategories])],
  controllers: [VehiclesController],
  providers: [VehiclesService],
})
export class VehiclesModule {}
