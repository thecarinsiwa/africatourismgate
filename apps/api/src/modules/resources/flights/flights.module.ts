import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Flights } from '../../../entities/generated';
import { FlightsController } from './flights.controller';
import { FlightsService } from './flights.service';

@Module({
  imports: [TypeOrmModule.forFeature([Flights])],
  controllers: [FlightsController],
  providers: [FlightsService],
})
export class FlightsModule {}
