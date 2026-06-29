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
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

@Module({
  imports: [
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
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
