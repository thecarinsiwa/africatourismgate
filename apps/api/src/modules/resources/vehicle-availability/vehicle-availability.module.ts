import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleAvailability, Vehicles } from '../../../entities/generated';
import { VehicleAvailabilityController } from './vehicle-availability.controller';
import { VehicleAvailabilityService } from './vehicle-availability.service';

@Module({
  imports: [TypeOrmModule.forFeature([VehicleAvailability, Vehicles])],
  controllers: [VehicleAvailabilityController],
  providers: [VehicleAvailabilityService],
})
export class VehicleAvailabilityModule {}
