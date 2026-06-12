import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Activities,
  ActivityProviders,
  ActivitySchedules,
  Destinations,
} from '../../../entities/generated';
import { PublicActivitiesController } from './public-activities.controller';
import { PublicActivitiesService } from './public-activities.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Activities,
      ActivityProviders,
      ActivitySchedules,
      Destinations,
    ]),
  ],
  controllers: [PublicActivitiesController],
  providers: [PublicActivitiesService],
})
export class PublicActivitiesModule {}
