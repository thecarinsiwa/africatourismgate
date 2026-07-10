import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Airlines,
  Airports,
  BookingItems,
  FlightClassAvailability,
  FlightClasses,
  Flights,
  Organizations,
} from '../../../../entities/generated';
import { EmailModule } from '../../../email/email.module';
import { FlightReportsController } from './flight-reports.controller';
import { FlightReportsService } from './flight-reports.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Flights,
      Airlines,
      Airports,
      FlightClasses,
      FlightClassAvailability,
      BookingItems,
      Organizations,
    ]),
    EmailModule,
  ],
  controllers: [FlightReportsController],
  providers: [FlightReportsService],
  exports: [FlightReportsService],
})
export class FlightReportsModule {}
