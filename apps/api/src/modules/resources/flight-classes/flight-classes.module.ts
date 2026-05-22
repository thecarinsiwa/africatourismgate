import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlightClasses, Flights } from '../../../entities/generated';
import { FlightClassesController } from './flight-classes.controller';
import { FlightClassesService } from './flight-classes.service';

@Module({
  imports: [TypeOrmModule.forFeature([FlightClasses, Flights])],
  controllers: [FlightClassesController],
  providers: [FlightClassesService],
})
export class FlightClassesModule {}
