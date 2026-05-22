import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Airlines, Airports, Flights } from '../../../entities/generated';
import { FlightsController } from './flights.controller';
import { FlightsService } from './flights.service';

@Module({
  imports: [TypeOrmModule.forFeature([Flights, Airlines, Airports])],
  controllers: [FlightsController],
  providers: [FlightsService],
})
export class FlightsModule {}
