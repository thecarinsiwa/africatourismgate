import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, QueryFailedError, Repository } from 'typeorm';
import {
  PaginatedResult,
  PaginationQueryDto,
} from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import {
  BookingItems,
  Bookings,
  Properties,
  Reviews,
  Rooms,
  Users,
} from '../../../entities/generated';
import { AdminReviewDetailDto } from './dto/admin-review-detail.dto';
import { AdminReviewListItemDto } from './dto/admin-review-list-item.dto';
import { CreateBookingReviewDto } from './dto/create-booking-review.dto';
import { PropertyReviewSummaryDto, ReviewDto } from './dto/review.dto';
import { ReviewsListQueryDto } from './dto/reviews-list-query.dto';
import { isStayEnded } from './review-stay.util';

type ReviewRow = {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  createdAt: Date;
  authorFirstName: string | null;
};

type AdminReviewRow = {
  id: string;
  rating: string | number;
  status: Reviews['status'];
  createdAt: Date;
  authorFirstName: string | null;
  authorEmail: string | null;
  entityType: Reviews['entityType'];
  entityId: string;
  propertyId: string | null;
  propertyName: string | null;
};

@Injectable()
export class ReviewsService extends CrudService<Reviews> {
  constructor(
    @InjectRepository(Reviews)
    private readonly reviewsRepository: Repository<Reviews>,
    @InjectRepository(Bookings)
    private readonly bookingsRepository: Repository<Bookings>,
    @InjectRepository(BookingItems)
    private readonly bookingItemsRepository: Repository<BookingItems>,
    @InjectRepository(Rooms)
    private readonly roomsRepository: Repository<Rooms>,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    @InjectRepository(Properties)
    private readonly propertiesRepository: Repository<Properties>,
  ) {
    super(reviewsRepository);
  }

  async findByBooking(bookingId: string): Promise<ReviewDto | null> {
    const review = await this.reviewsRepository.findOne({
      where: {
        entityType: 'booking',
        entityId: bookingId,
        deletedAt: IsNull(),
      },
    });
    if (!review) return null;

    const author = await this.usersRepository.findOne({
      where: { id: review.userId },
    });

    return this.toReviewDto(review, author?.firstName ?? null);
  }

  async canReview(bookingId: string, userId: string): Promise<boolean> {
    try {
      await this.assertCanReview(bookingId, userId);
      return true;
    } catch {
      return false;
    }
  }

  async assertCanReview(bookingId: string, userId: string): Promise<void> {
    const booking = await this.bookingsRepository.findOne({
      where: { id: bookingId, deletedAt: IsNull() },
    });
    if (!booking) {
      throw new NotFoundException('Réservation introuvable.');
    }
    if (booking.userId !== userId) {
      throw new ForbiddenException('Access denied.');
    }
    if (booking.status !== 'confirmed') {
      throw new BadRequestException(
        'Seules les réservations confirmées peuvent recevoir un avis.',
      );
    }

    const items = await this.bookingItemsRepository.find({
      where: { bookingId, deletedAt: IsNull() },
    });
    if (!isStayEnded(items)) {
      throw new BadRequestException(
        'Vous pourrez laisser un avis une fois votre séjour terminé.',
      );
    }

    const existing = await this.reviewsRepository.findOne({
      where: {
        entityType: 'booking',
        entityId: bookingId,
        deletedAt: IsNull(),
      },
    });
    if (existing) {
      throw new ConflictException('Un avis existe déjà pour cette réservation.');
    }
  }

  async createForBooking(
    bookingId: string,
    userId: string,
    dto: CreateBookingReviewDto,
    actorUserId?: string,
  ): Promise<ReviewDto> {
    await this.assertCanReview(bookingId, userId);

    try {
      const saved = await super.create(
        {
          userId,
          entityType: 'booking',
          entityId: bookingId,
          rating: dto.rating,
          title: dto.title?.trim() || undefined,
          body: dto.body?.trim() || undefined,
          status: 'pending',
        },
        actorUserId ?? userId,
      );
      const author = await this.usersRepository.findOne({
        where: { id: userId },
      });
      return this.toReviewDto(saved, author?.firstName ?? null);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string })?.code === 'ER_DUP_ENTRY'
      ) {
        throw new ConflictException('Un avis existe déjà pour cette réservation.');
      }
      throw error;
    }
  }

  async aggregateForProperty(propertyId: string): Promise<PropertyReviewSummaryDto> {
    const raw = await this.propertyReviewsQueryBuilder(propertyId)
      .select('AVG(r.rating)', 'averageRating')
      .addSelect('COUNT(DISTINCT r.id)', 'reviewCount')
      .getRawOne<{ averageRating: string | null; reviewCount: string }>();

    const reviewCount = Number(raw?.reviewCount ?? 0);
    if (reviewCount === 0) {
      return { averageRating: null, reviewCount: 0 };
    }

    const avg = Number(raw?.averageRating ?? 0);
    return {
      averageRating: Math.round(avg * 10) / 10,
      reviewCount,
    };
  }

  async listForProperty(
    propertyId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<ReviewDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const baseQb = this.propertyReviewsQueryBuilder(propertyId);

    const total = Number(
      (
        await baseQb
          .clone()
          .select('COUNT(DISTINCT r.id)', 'count')
          .getRawOne<{ count: string }>()
      )?.count ?? 0,
    );

    const rows = await baseQb
      .select('r.id', 'id')
      .addSelect('r.rating', 'rating')
      .addSelect('r.title', 'title')
      .addSelect('r.body', 'body')
      .addSelect('r.createdAt', 'createdAt')
      .addSelect('u.firstName', 'authorFirstName')
      .groupBy('r.id')
      .addGroupBy('r.rating')
      .addGroupBy('r.title')
      .addGroupBy('r.body')
      .addGroupBy('r.createdAt')
      .addGroupBy('u.firstName')
      .orderBy('r.createdAt', 'DESC')
      .offset((page - 1) * limit)
      .limit(limit)
      .getRawMany<ReviewRow>();

    return {
      data: rows.map((row) => ({
        id: row.id,
        rating: Number(row.rating),
        title: row.title,
        body: row.body,
        authorFirstName: row.authorFirstName,
        createdAt:
          row.createdAt instanceof Date
            ? row.createdAt.toISOString()
            : String(row.createdAt),
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async listForAdmin(
    query: ReviewsListQueryDto,
  ): Promise<PaginatedResult<AdminReviewListItemDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.adminListQueryBuilder();
    if (query.rating != null) {
      qb.andWhere('r.rating = :rating', { rating: query.rating });
    }
    if (query.status) {
      qb.andWhere('r.status = :status', { status: query.status });
    }
    if (query.propertyId) {
      qb.andWhere('rm.propertyId = :propertyId', { propertyId: query.propertyId });
    }

    const total = Number(
      (
        await qb
          .clone()
          .select('COUNT(DISTINCT r.id)', 'count')
          .getRawOne<{ count: string }>()
      )?.count ?? 0,
    );

    const rows = await qb
      .select('r.id', 'id')
      .addSelect('r.rating', 'rating')
      .addSelect('r.status', 'status')
      .addSelect('r.createdAt', 'createdAt')
      .addSelect('u.firstName', 'authorFirstName')
      .addSelect('u.email', 'authorEmail')
      .addSelect('r.entityType', 'entityType')
      .addSelect('r.entityId', 'entityId')
      .addSelect('rm.propertyId', 'propertyId')
      .addSelect('p.name', 'propertyName')
      .groupBy('r.id')
      .addGroupBy('r.rating')
      .addGroupBy('r.status')
      .addGroupBy('r.createdAt')
      .addGroupBy('u.firstName')
      .addGroupBy('u.email')
      .addGroupBy('r.entityType')
      .addGroupBy('r.entityId')
      .addGroupBy('rm.propertyId')
      .addGroupBy('p.name')
      .orderBy('r.createdAt', 'DESC')
      .offset((page - 1) * limit)
      .limit(limit)
      .getRawMany<AdminReviewRow>();

    return {
      data: rows.map((row) => this.toAdminListItem(row)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOneForAdmin(id: string): Promise<AdminReviewDetailDto> {
    const review = await this.reviewsRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!review) {
      throw new NotFoundException(`Resource ${id} not found`);
    }

    const author = await this.usersRepository.findOne({
      where: { id: review.userId, deletedAt: IsNull() },
    });
    const propertyId = await this.resolvePropertyIdForReview(review);
    let propertyName: string | null = null;
    if (propertyId) {
      const property = await this.propertiesRepository.findOne({
        where: { id: propertyId, deletedAt: IsNull() },
      });
      propertyName = property?.name ?? null;
    }

    return {
      id: review.id,
      rating: review.rating,
      status: review.status,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt?.toISOString() ?? null,
      authorFirstName: author?.firstName ?? null,
      authorEmail: author?.email ?? null,
      entityType: review.entityType,
      entityId: review.entityId,
      propertyId,
      propertyName,
      userId: review.userId,
      title: review.title || null,
      body: review.body || null,
    };
  }

  async updateStatus(
    id: string,
    status: 'approved' | 'hidden',
    actorUserId: string,
  ): Promise<AdminReviewDetailDto> {
    await this.update(id, { status }, actorUserId);
    return this.findOneForAdmin(id);
  }

  async removeReview(id: string, actorUserId: string): Promise<void> {
    await this.remove(id, actorUserId);
  }

  private async resolvePropertyIdForReview(review: Reviews): Promise<string | null> {
    if (review.entityType === 'booking') {
      return this.resolvePropertyIdForBooking(review.entityId);
    }
    if (review.entityType === 'property') {
      return review.entityId;
    }
    return null;
  }

  async resolvePropertyIdForBooking(bookingId: string): Promise<string | null> {
    const roomItem = await this.bookingItemsRepository.findOne({
      where: {
        bookingId,
        itemType: 'room',
        deletedAt: IsNull(),
      },
      order: { startDate: 'ASC', createdAt: 'ASC' },
    });
    if (!roomItem) return null;

    const room = await this.roomsRepository.findOne({
      where: { id: roomItem.referenceId, deletedAt: IsNull() },
    });
    return room?.propertyId ?? null;
  }

  private propertyReviewsQueryBuilder(propertyId: string) {
    return this.reviewsRepository
      .createQueryBuilder('r')
      .innerJoin(
        Bookings,
        'b',
        "b.id = r.entityId AND r.entityType = 'booking' AND b.deletedAt IS NULL",
      )
      .innerJoin(
        BookingItems,
        'bi',
        "bi.bookingId = b.id AND bi.itemType = 'room' AND bi.deletedAt IS NULL",
      )
      .innerJoin(
        Rooms,
        'rm',
        'rm.id = bi.referenceId AND rm.deletedAt IS NULL',
      )
      .innerJoin(Users, 'u', 'u.id = r.userId AND u.deletedAt IS NULL')
      .where('r.deletedAt IS NULL')
      .andWhere("r.status = 'approved'")
      .andWhere('rm.propertyId = :propertyId', { propertyId });
  }

  private adminListQueryBuilder() {
    return this.reviewsRepository
      .createQueryBuilder('r')
      .innerJoin(Users, 'u', 'u.id = r.userId AND u.deletedAt IS NULL')
      .leftJoin(
        Bookings,
        'b',
        "b.id = r.entityId AND r.entityType = 'booking' AND b.deletedAt IS NULL",
      )
      .leftJoin(
        BookingItems,
        'bi',
        "bi.bookingId = b.id AND bi.itemType = 'room' AND bi.deletedAt IS NULL",
      )
      .leftJoin(
        Rooms,
        'rm',
        'rm.id = bi.referenceId AND rm.deletedAt IS NULL',
      )
      .leftJoin(Properties, 'p', 'p.id = rm.propertyId AND p.deletedAt IS NULL')
      .where('r.deletedAt IS NULL');
  }

  private toAdminListItem(row: AdminReviewRow): AdminReviewListItemDto {
    return {
      id: row.id,
      rating: Number(row.rating),
      status: row.status,
      createdAt:
        row.createdAt instanceof Date
          ? row.createdAt.toISOString()
          : String(row.createdAt),
      authorFirstName: row.authorFirstName,
      authorEmail: row.authorEmail,
      entityType: row.entityType,
      entityId: row.entityId,
      propertyId: row.propertyId,
      propertyName: row.propertyName,
    };
  }

  private toReviewDto(review: Reviews, authorFirstName: string | null): ReviewDto {
    return {
      id: review.id,
      rating: review.rating,
      title: review.title || null,
      body: review.body || null,
      authorFirstName,
      createdAt: review.createdAt.toISOString(),
    };
  }
}
