import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Flights } from '../../../entities/generated';
import { FlightReportsModule } from './flight-reports/flight-reports.module';
import { FlightsController } from './flights.controller';
import { FlightsService } from './flights.service';

@Module({
  imports: [TypeOrmModule.forFeature([Flights]), FlightReportsModule],
  controllers: [FlightsController],
  providers: [FlightsService],
})
export class FlightsModule {}
