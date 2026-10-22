import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  BookingGuideAssignments,
  BookingItems,
  Bookings,
  Properties,
  Reviews,
  Rooms,
  TourGuides,
  Users,
} from '../../../entities/generated';
import { TripadvisorTerraClient } from '../../integrations/tripadvisor/tripadvisor-terra.client';
import { NotificationsModule } from '../notifications/notifications.module';
import { OrganizationSettingsModule } from '../organization-settings/organization-settings.module';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

@Module({
  imports: [
    NotificationsModule,
    OrganizationSettingsModule,
    TypeOrmModule.forFeature([
      Reviews,
      Bookings,
      BookingItems,
      BookingGuideAssignments,
      TourGuides,
      Rooms,
      Users,
      Properties,
    ]),
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService, TripadvisorTerraClient],
  exports: [ReviewsService],
})
export class ReviewsModule {}
