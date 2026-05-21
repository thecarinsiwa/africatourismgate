import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Itineraries, ItineraryPorts } from '../../../entities/generated';
import { ItineraryPortsController } from './itinerary-ports.controller';
import { ItineraryPortsService } from './itinerary-ports.service';

@Module({
  imports: [TypeOrmModule.forFeature([ItineraryPorts, Itineraries])],
  controllers: [ItineraryPortsController],
  providers: [ItineraryPortsService],
})
export class ItineraryPortsModule {}
