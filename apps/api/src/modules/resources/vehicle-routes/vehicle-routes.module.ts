import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Destinations,
  VehicleRoutes,
  Vehicles,
} from '../../../entities/generated';
import { VehicleRoutesController } from './vehicle-routes.controller';
import { VehicleRoutesService } from './vehicle-routes.service';

@Module({
  imports: [TypeOrmModule.forFeature([VehicleRoutes, Vehicles, Destinations])],
  controllers: [VehicleRoutesController],
  providers: [VehicleRoutesService],
  exports: [VehicleRoutesService],
})
export class VehicleRoutesModule {}
