import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../auth/decorators/public.decorator';
import { ReviewsService } from '../../resources/reviews/reviews.service';
import { PublicFeaturedReviewsListQueryDto } from './dto/public-featured-reviews-list-query.dto';

@ApiTags('public')
@Controller('public')
export class PublicReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Public()
  @Get('reviews/featured')
  @ApiOperation({ summary: 'List featured approved customer reviews for homepage' })
  listFeatured(@Query() query: PublicFeaturedReviewsListQueryDto) {
    return this.reviewsService.listFeaturedForHomepage(query.limit ?? 12);
  }
}
