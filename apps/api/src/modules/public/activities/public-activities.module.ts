import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Activities,
  ActivityBookingRequests,
  ActivityImages,
  ActivityItineraryStops,
  ActivityProviders,
  ActivitySchedules,
  Destinations,
  Organizations,
  Reviews,
} from '../../../entities/generated';
import { PublicActivitiesController } from './public-activities.controller';
import { PublicActivitiesService } from './public-activities.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Activities,
      ActivityBookingRequests,
      ActivityImages,
      ActivityItineraryStops,
      ActivityProviders,
      ActivitySchedules,
      Destinations,
      Organizations,
      Reviews,
    ]),
  ],
  controllers: [PublicActivitiesController],
  providers: [PublicActivitiesService],
  exports: [PublicActivitiesService],
})
export class PublicActivitiesModule {}
