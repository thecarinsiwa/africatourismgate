import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { newId } from '../../../common/utils/uuid';
import {
  BookingGuideAssignmentHistory,
  BookingGuideAssignments,
  Bookings,
  TourGuides,
  Users,
} from '../../../entities/generated';
import {
  AssignBookingGuidesDto,
  assignmentHistorySnapshot,
  BookingGuideAssignmentDto,
  toBookingGuideAssignmentDto,
  UpdateBookingGuideAssignmentDto,
} from './dto/booking-guide-assignment.dto';
import {
  BookingGuideAssignmentHistoryItemDto,
  toBookingGuideAssignmentHistoryItemDto,
} from './dto/booking-guide-assignment-history.dto';
import {
  toTourGuideBookingListItemDto,
  TourGuideBookingListItemDto,
} from './dto/tour-guide-booking-list-item.dto';
import { TourGuideBookingsListQueryDto } from './dto/tour-guide-bookings-list-query.dto';
import { GuideScheduleConflictService } from './guide-schedule-conflict.service';
import { parseScheduleInstant } from './guide-schedule.util';
import { TourGuidesService } from './tour-guides.service';
import { BookingGuideAssignmentEmailService } from './booking-guide-assignment-email.service';

@Injectable()
export class BookingGuideAssignmentsService {
  constructor(
    @InjectRepository(BookingGuideAssignments)
    private readonly assignmentsRepository: Repository<BookingGuideAssignments>,
    @InjectRepository(BookingGuideAssignmentHistory)
    private readonly historyRepository: Repository<BookingGuideAssignmentHistory>,
    @InjectRepository(Bookings)
    private readonly bookingsRepository: Repository<Bookings>,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    @InjectRepository(TourGuides)
    private readonly tourGuidesRepository: Repository<TourGuides>,
    private readonly tourGuidesService: TourGuidesService,
    private readonly guideAssignmentEmail: BookingGuideAssignmentEmailService,
    private readonly scheduleConflictService: GuideScheduleConflictService,
  ) {}

  async listByGuideId(
    guideId: string,
    query: TourGuideBookingsListQueryDto,
  ): Promise<PaginatedResult<TourGuideBookingListItemDto>> {
    await this.tourGuidesService.findOneDto(guideId);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const sortOrder = query.sortOrder ?? 'desc';
    const search = query.search?.trim();

    const qb = this.assignmentsRepository
      .createQueryBuilder('assignment')
      .innerJoin(
        Bookings,
        'booking',
        'booking.id = assignment.bookingId AND booking.deletedAt IS NULL',
      )
      .where('assignment.guideId = :guideId', { guideId });

    if (search) {
      qb.innerJoin(
        Users,
        'client',
        'client.id = booking.userId AND client.deletedAt IS NULL',
      );
      qb.andWhere(
        '(client.email LIKE :term OR client.firstName LIKE :term OR client.lastName LIKE :term OR booking.id LIKE :term)',
        { term: `%${search}%` },
      );
    }

    const total = await qb.getCount();

    const assignments = await qb
      .orderBy('assignment.startDatetime', sortOrder === 'asc' ? 'ASC' : 'DESC')
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
      order: { startDatetime: 'ASC' },
    });
    return rows.map(toBookingGuideAssignmentDto);
  }

  async listHistoryByBookingId(
    bookingId: string,
  ): Promise<BookingGuideAssignmentHistoryItemDto[]> {
    await this.requireBooking(bookingId);
    const rows = await this.historyRepository.find({
      where: { bookingId },
      order: { createdAt: 'DESC' },
    });
    if (rows.length === 0) {
      return [];
    }

    const guideIds = [...new Set(rows.map((row) => row.guideId))];
    const actorIds = [
      ...new Set(rows.map((row) => row.actorUserId).filter((id): id is string => Boolean(id))),
    ];

    const guides =
      guideIds.length > 0
        ? await this.tourGuidesRepository.find({ where: { id: In(guideIds) } })
        : [];
    const actors =
      actorIds.length > 0
        ? await this.usersRepository.find({ where: { id: In(actorIds) } })
        : [];

    const guideById = new Map(guides.map((guide) => [guide.id, guide]));
    const actorById = new Map(actors.map((user) => [user.id, user]));

    return rows.map((row) => {
      const guide = guideById.get(row.guideId);
      const actor = row.actorUserId ? actorById.get(row.actorUserId) : undefined;
      const actorDisplayName = actor
        ? [actor.firstName, actor.lastName].filter(Boolean).join(' ').trim() || actor.email
        : null;
      return toBookingGuideAssignmentHistoryItemDto(row, {
        guideDisplayName: guide?.displayName ?? null,
        actorDisplayName,
      });
    });
  }

  async assignGuides(
    bookingId: string,
    dto: AssignBookingGuidesDto,
    actorUserId: string,
  ): Promise<BookingGuideAssignmentDto[]> {
    await this.requireBooking(bookingId);

    const batchSlots = dto.guides.map((item, index) => {
      const { start, end } = this.scheduleConflictService.parseRange(
        item.startDatetime,
        item.endDatetime,
      );
      return {
        guideId: item.guideId,
        start,
        end,
        label: `slot-${index + 1}`,
      };
    });
    this.scheduleConflictService.assertNoInternalBatchOverlaps(batchSlots);

    for (const item of dto.guides) {
      await this.tourGuidesService.requireActiveGuide(item.guideId);
    }

    const results: BookingGuideAssignmentDto[] = [];

    for (const item of dto.guides) {
      const role = item.role ?? 'primary';
      const { start, end } = this.scheduleConflictService.parseRange(
        item.startDatetime,
        item.endDatetime,
      );

      await this.scheduleConflictService.assertAssignable(item.guideId, start, end);

      const created = this.assignmentsRepository.create({
        id: newId(),
        bookingId,
        guideId: item.guideId,
        role,
        startDatetime: start,
        endDatetime: end,
        notes: item.notes?.trim() || null,
        assignedByUserId: actorUserId,
      });
      const saved = await this.assignmentsRepository.save(created);
      await this.recordHistory(saved, 'created', actorUserId);
      results.push(toBookingGuideAssignmentDto(saved));
      this.guideAssignmentEmail.notifyGuideAssigned(bookingId, item.guideId, role);
    }

    return results;
  }

  async updateAssignment(
    bookingId: string,
    assignmentId: string,
    dto: UpdateBookingGuideAssignmentDto,
    actorUserId: string,
  ): Promise<BookingGuideAssignmentDto> {
    await this.requireBooking(bookingId);
    const assignment = await this.requireAssignment(bookingId, assignmentId);

    const nextStart = dto.startDatetime
      ? parseScheduleInstant(dto.startDatetime)
      : parseScheduleInstant(assignment.startDatetime);
    const nextEnd = dto.endDatetime
      ? parseScheduleInstant(dto.endDatetime)
      : parseScheduleInstant(assignment.endDatetime);

    this.scheduleConflictService.parseRange(nextStart, nextEnd);

    await this.scheduleConflictService.assertAssignable(
      assignment.guideId,
      nextStart,
      nextEnd,
      { excludeAssignmentId: assignment.id },
    );

    assignment.startDatetime = nextStart;
    assignment.endDatetime = nextEnd;
    if (dto.role !== undefined) {
      assignment.role = dto.role;
    }
    if (dto.notes !== undefined) {
      assignment.notes = dto.notes?.trim() || null;
    }
    assignment.assignedByUserId = actorUserId;

    const saved = await this.assignmentsRepository.save(assignment);
    await this.recordHistory(saved, 'updated', actorUserId);
    return toBookingGuideAssignmentDto(saved);
  }

  async removeAssignment(
    bookingId: string,
    assignmentId: string,
    comment?: string | null,
  ): Promise<void> {
    await this.requireBooking(bookingId);
    const assignment = await this.requireAssignment(bookingId, assignmentId);

    this.guideAssignmentEmail.notifyGuideRemoved(
      bookingId,
      assignment.guideId,
      assignment.role,
      comment,
    );
    await this.recordHistory(assignment, 'deleted', assignment.assignedByUserId ?? null);
    await this.assignmentsRepository.delete(assignment.id);
  }

  async removeGuide(
    bookingId: string,
    guideId: string,
    comment?: string | null,
  ): Promise<void> {
    await this.requireBooking(bookingId);
    const assignments = await this.assignmentsRepository.find({
      where: { bookingId, guideId },
      order: { startDatetime: 'ASC' },
    });
    if (assignments.length === 0) {
      throw new NotFoundException(
        `Aucune assignation du guide ${guideId} sur la réservation ${bookingId}.`,
      );
    }

    for (const assignment of assignments) {
      await this.removeAssignment(bookingId, assignment.id, comment);
    }
  }

  private async requireAssignment(
    bookingId: string,
    assignmentId: string,
  ): Promise<BookingGuideAssignments> {
    const assignment = await this.assignmentsRepository.findOne({
      where: { id: assignmentId, bookingId },
    });
    if (!assignment) {
      throw new NotFoundException(
        `Assignation ${assignmentId} introuvable sur la réservation ${bookingId}.`,
      );
    }
    return assignment;
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

  private async recordHistory(
    assignment: BookingGuideAssignments,
    action: BookingGuideAssignmentHistory['action'],
    actorUserId: string | null,
  ): Promise<void> {
    const row = this.historyRepository.create({
      id: newId(),
      assignmentId: assignment.id,
      bookingId: assignment.bookingId,
      guideId: assignment.guideId,
      action,
      snapshot: assignmentHistorySnapshot(assignment),
      actorUserId,
    });
    await this.historyRepository.save(row);
  }
}
