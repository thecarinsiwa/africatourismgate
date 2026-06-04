import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  BookingItems,
  Bookings,
  Properties,
  Reviews,
  Rooms,
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
