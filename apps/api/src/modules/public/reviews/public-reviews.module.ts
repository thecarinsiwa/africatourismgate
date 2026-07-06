import { Module } from '@nestjs/common';
import { ReviewsModule } from '../../resources/reviews/reviews.module';
import { PublicReviewsController } from './public-reviews.controller';

@Module({
  imports: [ReviewsModule],
  controllers: [PublicReviewsController],
})
export class PublicReviewsModule {}
