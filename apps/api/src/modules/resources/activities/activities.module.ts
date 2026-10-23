import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Activities,
  ActivityBookingRequests,
} from '../../../entities/generated';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { ActivityBookingRequestsService } from './activity-booking-requests.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Activities, ActivityBookingRequests]),
  ],
  controllers: [ActivitiesController],
  providers: [ActivitiesService, ActivityBookingRequestsService],
})
export class ActivitiesModule {}
