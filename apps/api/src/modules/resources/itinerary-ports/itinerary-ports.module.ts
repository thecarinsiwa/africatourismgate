import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItineraryPorts } from '../../../entities/generated';
import { ItineraryPortsController } from './itinerary-ports.controller';
import { ItineraryPortsService } from './itinerary-ports.service';

@Module({
  imports: [TypeOrmModule.forFeature([ItineraryPorts])],
  controllers: [ItineraryPortsController],
  providers: [ItineraryPortsService],
})
export class ItineraryPortsModule {}
