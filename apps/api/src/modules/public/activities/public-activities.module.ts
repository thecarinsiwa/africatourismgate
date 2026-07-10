import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Activities,
  ActivityImages,
  ActivityItineraryStops,
  ActivityProviders,
  ActivitySchedules,
  Destinations,
  Reviews,
} from '../../../entities/generated';
import { PublicActivitiesController } from './public-activities.controller';
import { PublicActivitiesService } from './public-activities.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Activities,
      ActivityImages,
      ActivityItineraryStops,
      ActivityProviders,
      ActivitySchedules,
      Destinations,
      Reviews,
    ]),
  ],
  controllers: [PublicActivitiesController],
  providers: [PublicActivitiesService],
})
export class PublicActivitiesModule {}
