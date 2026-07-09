import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityItineraryStops } from '../../../entities/generated';
import { ActivityItineraryStopsController } from './activity-itinerary-stops.controller';
import { ActivityItineraryStopsService } from './activity-itinerary-stops.service';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityItineraryStops])],
  controllers: [ActivityItineraryStopsController],
  providers: [ActivityItineraryStopsService],
  exports: [ActivityItineraryStopsService],
})
export class ActivityItineraryStopsModule {}
