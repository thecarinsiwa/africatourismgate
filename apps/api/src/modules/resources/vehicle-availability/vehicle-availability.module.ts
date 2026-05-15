import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleAvailability } from '../../../entities/generated';
import { VehicleAvailabilityController } from './vehicle-availability.controller';
import { VehicleAvailabilityService } from './vehicle-availability.service';

@Module({
  imports: [TypeOrmModule.forFeature([VehicleAvailability])],
  controllers: [VehicleAvailabilityController],
  providers: [VehicleAvailabilityService],
})
export class VehicleAvailabilityModule {}
