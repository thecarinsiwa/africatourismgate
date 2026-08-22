import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { newId } from '../../../common/utils/uuid';
import {
  BookingGuideAssignments,
  Bookings,
  Users,
} from '../../../entities/generated';
import {
  AssignBookingGuidesDto,
  BookingGuideAssignmentDto,
  toBookingGuideAssignmentDto,
} from './dto/booking-guide-assignment.dto';
import {
  toTourGuideBookingListItemDto,
  TourGuideBookingListItemDto,
} from './dto/tour-guide-booking-list-item.dto';
import { TourGuideBookingsListQueryDto } from './dto/tour-guide-bookings-list-query.dto';
import { TourGuidesService } from './tour-guides.service';
import { BookingGuideAssignmentEmailService } from './booking-guide-assignment-email.service';

@Injectable()
export class BookingGuideAssignmentsService {
  constructor(
    @InjectRepository(BookingGuideAssignments)
    private readonly assignmentsRepository: Repository<BookingGuideAssignments>,
    @InjectRepository(Bookings)
    private readonly bookingsRepository: Repository<Bookings>,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    private readonly tourGuidesService: TourGuidesService,
    private readonly guideAssignmentEmail: BookingGuideAssignmentEmailService,
  ) {}

  async listByGuideId(
    guideId: string,
    query: TourGuideBookingsListQueryDto,
  ): Promise<PaginatedResult<TourGuideBookingListItemDto>> {
    await this.tourGuidesService.findOneDto(guideId);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const sortOrder = query.sortOrder ?? 'desc';

    const qb = this.assignmentsRepository
      .createQueryBuilder('assignment')
      .innerJoin(
        Bookings,
        'booking',
        'booking.id = assignment.bookingId AND booking.deletedAt IS NULL',
      )
      .where('assignment.guideId = :guideId', { guideId });

    const total = await qb.getCount();

    const assignments = await qb
      .orderBy('assignment.assignedAt', sortOrder === 'asc' ? 'ASC' : 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    if (assignments.length === 0) {
      return {
        data: [],
        meta: { total, page, limit, totalPages: total === 0 ? 0 : Math.ceil(total / limit) },
      };
    }

    const bookingIds = [...new Set(assignments.map((row) => row.bookingId))];
    const bookings = await this.bookingsRepository.find({
      where: { id: In(bookingIds), deletedAt: IsNull() },
    });
    const bookingById = new Map(bookings.map((booking) => [booking.id, booking]));

    const userIds = [...new Set(bookings.map((booking) => booking.userId))];
    const users =
      userIds.length > 0
        ? await this.usersRepository.find({ where: { id: In(userIds) } })
        : [];
    const userById = new Map(users.map((user) => [user.id, user]));

    const data = assignments.flatMap((assignment) => {
      const booking = bookingById.get(assignment.bookingId);
      if (!booking) return [];
      const client = userById.get(booking.userId);
      return [toTourGuideBookingListItemDto(assignment, booking, client)];
    });

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async listByBookingId(bookingId: string): Promise<BookingGuideAssignmentDto[]> {
    await this.requireBooking(bookingId);
    const rows = await this.assignmentsRepository.find({
      where: { bookingId },
      order: { assignedAt: 'ASC' },
    });
    return rows.map(toBookingGuideAssignmentDto);
  }

  async assignGuides(
    bookingId: string,
    dto: AssignBookingGuidesDto,
    actorUserId: string,
  ): Promise<BookingGuideAssignmentDto[]> {
    await this.requireBooking(bookingId);

    const seenGuideIds = new Set<string>();
    for (const item of dto.guides) {
      if (seenGuideIds.has(item.guideId)) {
        throw new BadRequestException(
          `Le guide ${item.guideId} est en double dans la requête.`,
        );
      }
      seenGuideIds.add(item.guideId);
      await this.tourGuidesService.requireActiveGuide(item.guideId);
    }

    const results: BookingGuideAssignmentDto[] = [];

    for (const item of dto.guides) {
      const role = item.role ?? 'primary';
      const existing = await this.assignmentsRepository.findOne({
        where: { bookingId, guideId: item.guideId },
      });

      if (existing) {
        existing.role = role;
        existing.assignedByUserId = actorUserId;
        const saved = await this.assignmentsRepository.save(existing);
        results.push(toBookingGuideAssignmentDto(saved));
        continue;
      }

      const created = this.assignmentsRepository.create({
        id: newId(),
        bookingId,
        guideId: item.guideId,
        role,
        assignedByUserId: actorUserId,
      });
      const saved = await this.assignmentsRepository.save(created);
      results.push(toBookingGuideAssignmentDto(saved));
      this.guideAssignmentEmail.notifyGuideAssigned(bookingId, item.guideId, role);
    }

    return results;
  }

  async removeGuide(
    bookingId: string,
    guideId: string,
    comment?: string | null,
  ): Promise<void> {
    await this.requireBooking(bookingId);
    const assignment = await this.assignmentsRepository.findOne({
      where: { bookingId, guideId },
    });
    if (!assignment) {
      throw new NotFoundException(
        `Aucune assignation du guide ${guideId} sur la réservation ${bookingId}.`,
      );
    }

    this.guideAssignmentEmail.notifyGuideRemoved(
      bookingId,
      guideId,
      assignment.role,
      comment,
    );
    await this.assignmentsRepository.delete(assignment.id);
  }

  private async requireBooking(bookingId: string): Promise<Bookings> {
    const booking = await this.bookingsRepository.findOne({
      where: { id: bookingId, deletedAt: IsNull() },
    });
    if (!booking) {
      throw new NotFoundException(`Réservation ${bookingId} introuvable.`);
    }
    return booking;
  }
}
