import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { AdminReviewDetailDto } from './dto/admin-review-detail.dto';
import { AdminReviewListItemDto } from './dto/admin-review-list-item.dto';
import { ReviewsListQueryDto } from './dto/reviews-list-query.dto';
import { UpdateReviewStatusDto } from './dto/update-review-status.dto';
import { ReviewsService } from './reviews.service';

@ApiTags('reviews')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly service: ReviewsService) {}

  @Get()
  @RequirePermissions('reviews.read')
  @ApiOperation({ summary: 'List reviews for moderation (admin)' })
  findAll(
    @Query() query: ReviewsListQueryDto,
  ): Promise<{ data: AdminReviewListItemDto[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
    return this.service.listForAdmin(query);
  }

  @Get(':id')
  @RequirePermissions('reviews.read')
  @ApiOperation({ summary: 'Get review detail for moderation (admin)' })
  findOne(@Param('id') id: string): Promise<AdminReviewDetailDto> {
    return this.service.findOneForAdmin(id);
  }

  @Patch(':id')
  @RequirePermissions('reviews.write')
  @ApiOperation({ summary: 'Approve or hide a review' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateReviewStatusDto,
    @CurrentUser() user: AuthUserDto,
  ): Promise<AdminReviewDetailDto> {
    return this.service.updateStatus(id, dto.status, user.id);
  }

  @Delete(':id')
  @RequirePermissions('reviews.write')
  @ApiOperation({ summary: 'Soft-delete a review' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthUserDto,
  ): Promise<void> {
    await this.service.removeReview(id, user.id);
  }
}
