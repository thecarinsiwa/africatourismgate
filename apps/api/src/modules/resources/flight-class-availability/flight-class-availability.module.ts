import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlightClassAvailability } from '../../../entities/generated';
import { FlightClassAvailabilityController } from './flight-class-availability.controller';
import { FlightClassAvailabilityService } from './flight-class-availability.service';

@Module({
  imports: [TypeOrmModule.forFeature([FlightClassAvailability])],
  controllers: [FlightClassAvailabilityController],
  providers: [FlightClassAvailabilityService],
})
export class FlightClassAvailabilityModule {}
