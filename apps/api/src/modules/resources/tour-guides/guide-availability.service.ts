import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { newId } from '../../../common/utils/uuid';
import {
  BookingGuideAssignments,
  Bookings,
  GuideAvailability,
  TourGuides,
} from '../../../entities/generated';
import { enumerateMonthDays } from '../../public/accommodations/stay-dates.util';
import {
  GuideAvailabilitySlotDto,
  TourGuideCalendarDayDetailDto,
  TourGuideCalendarDayGuideDto,
  TourGuideCalendarSummaryDayDto,
  TourGuideCalendarSummaryDto,
} from './dto/tour-guide-calendar.dto';
import { TourGuideCalendarDayQueryDto } from './dto/tour-guide-calendar-day-query.dto';
import { TourGuideCalendarSummaryQueryDto } from './dto/tour-guide-calendar-summary-query.dto';
import { UpsertGuideAvailabilityDto } from './dto/upsert-guide-availability.dto';
import { GuideScheduleConflictService } from './guide-schedule-conflict.service';
import {
  dayBounds,
  formatScheduleInstant,
  overlapsDay,
  parseScheduleInstant,
  resolveScheduleRange,
} from './guide-schedule.util';
import { TourGuidesService } from './tour-guides.service';

const OCCUPIED_EXCLUDED_BOOKING_STATUSES = ['cancelled', 'refunded', 'draft'] as const;

type CalendarFilters = {
  destinationId?: string;
  organizationId?: string;
};

type GuideDayStatus = 'available' | 'occupied' | 'unavailable';

type GuideOccupancy = {
  assignmentId: string;
  bookingId: string;
  role: BookingGuideAssignments['role'];
  start: Date;
  end: Date;
};

@Injectable()
export class GuideAvailabilityService {
  constructor(
    @InjectRepository(GuideAvailability)
    private readonly availabilityRepository: Repository<GuideAvailability>,
    @InjectRepository(TourGuides)
    private readonly tourGuidesRepository: Repository<TourGuides>,
    @InjectRepository(BookingGuideAssignments)
    private readonly assignmentsRepository: Repository<BookingGuideAssignments>,
    private readonly tourGuidesService: TourGuidesService,
    private readonly scheduleConflictService: GuideScheduleConflictService,
  ) {}

  async getCalendarSummary(
    query: TourGuideCalendarSummaryQueryDto,
  ): Promise<TourGuideCalendarSummaryDto> {
    const guides = await this.listActiveGuides(query);
    const days = enumerateMonthDays(query.month);
    if (guides.length === 0 || days.length === 0) {
      return {
        month: query.month,
        days: days.map((date) => ({
          date,
          available: 0,
          occupied: 0,
          unavailable: 0,
          totalActive: 0,
        })),
      };
    }

    const guideIds = guides.map((guide) => guide.id);
    const rangeStart = dayBounds(days[0]!).start;
    const rangeEnd = dayBounds(days[days.length - 1]!).end;
    const unavailableByGuide = await this.loadUnavailableByGuide(guideIds, rangeStart, rangeEnd);
    const occupancyByGuide = await this.loadOccupancyByGuide(guideIds, rangeStart, rangeEnd);

    const summaryDays: TourGuideCalendarSummaryDayDto[] = days.map((date) => {
      let available = 0;
      let occupied = 0;
      let unavailable = 0;

      for (const guide of guides) {
        const status = this.resolveGuideDayStatus(
          guide.id,
          date,
          unavailableByGuide,
          occupancyByGuide,
        );
        if (status === 'occupied') occupied += 1;
        else if (status === 'unavailable') unavailable += 1;
        else available += 1;
      }

      return {
        date,
        available,
        occupied,
        unavailable,
        totalActive: guides.length,
      };
    });

    return { month: query.month, days: summaryDays };
  }

  async getCalendarDay(
    query: TourGuideCalendarDayQueryDto,
  ): Promise<TourGuideCalendarDayDetailDto> {
    const guides = await this.listActiveGuides(query);
    const date = query.date.slice(0, 10);

    if (guides.length === 0) {
      return { date, guides: [] };
    }

    const guideIds = guides.map((guide) => guide.id);
    const { start, end } = dayBounds(date);
    const unavailableByGuide = await this.loadUnavailableByGuide(guideIds, start, end);
    const occupancyByGuide = await this.loadOccupancyByGuide(guideIds, start, end);

    const guideRows: TourGuideCalendarDayGuideDto[] = guides.map((guide) => {
      const status = this.resolveGuideDayStatus(
        guide.id,
        date,
        unavailableByGuide,
        occupancyByGuide,
      );
      const occupancy = occupancyByGuide
        .get(guide.id)
        ?.find((entry) => overlapsDay(entry.start, entry.end, date));

      return {
        guideId: guide.id,
        displayName: guide.displayName,
        photoUrl: guide.photoUrl,
        status,
        ...(occupancy
          ? {
              bookingId: occupancy.bookingId,
              assignmentId: occupancy.assignmentId,
              role: occupancy.role,
            }
          : {}),
      };
    });

    guideRows.sort((left, right) => left.displayName.localeCompare(right.displayName, 'fr'));

    return { date, guides: guideRows };
  }

  async upsertAvailability(
    guideId: string,
    dto: UpsertGuideAvailabilityDto,
    actorUserId: string,
  ): Promise<GuideAvailabilitySlotDto> {
    await this.tourGuidesService.requireActiveGuide(guideId);
    const { start, end } = resolveScheduleRange(dto);

    if (dto.status === 'available') {
      const overlapping = await this.findUnavailableOverlapping(guideId, start, end);
      for (const row of overlapping) {
        await this.availabilityRepository.softDelete(row.id);
        await this.availabilityRepository.update(row.id, {
          deletedByUserId: actorUserId,
        });
      }
      return this.toAvailabilitySlotDto(guideId, start, end, 'available');
    }

    if (dto.availabilityId) {
      return this.updateUnavailableSlot(guideId, dto.availabilityId, start, end, actorUserId);
    }

    await this.scheduleConflictService.assertCanMarkUnavailable(guideId, start, end);

    const created = this.availabilityRepository.create({
      id: newId(),
      guideId,
      startDatetime: start,
      endDatetime: end,
      status: 'unavailable',
      createdByUserId: actorUserId,
    });
    await this.availabilityRepository.save(created);
    return this.toAvailabilitySlotDto(guideId, start, end, 'unavailable');
  }

  private async updateUnavailableSlot(
    guideId: string,
    availabilityId: string,
    start: Date,
    end: Date,
    actorUserId: string,
  ): Promise<GuideAvailabilitySlotDto> {
    const existing = await this.availabilityRepository.findOne({
      where: { id: availabilityId, guideId, deletedAt: IsNull() },
    });
    if (!existing) {
      throw new NotFoundException(
        `Indisponibilité ${availabilityId} introuvable pour le guide ${guideId}.`,
      );
    }

    await this.scheduleConflictService.assertCanMarkUnavailable(guideId, start, end, {
      excludeAvailabilityId: existing.id,
    });

    existing.startDatetime = start;
    existing.endDatetime = end;
    existing.status = 'unavailable';
    existing.updatedByUserId = actorUserId;
    await this.availabilityRepository.save(existing);
    return this.toAvailabilitySlotDto(guideId, start, end, 'unavailable');
  }

  private async findUnavailableOverlapping(
    guideId: string,
    start: Date,
    end: Date,
  ): Promise<GuideAvailability[]> {
    return this.availabilityRepository
      .createQueryBuilder('slot')
      .where('slot.guideId = :guideId', { guideId })
      .andWhere('slot.deletedAt IS NULL')
      .andWhere('slot.status = :status', { status: 'unavailable' })
      .andWhere('slot.startDatetime < :end', { end })
      .andWhere('slot.endDatetime > :start', { start })
      .getMany();
  }

  private toAvailabilitySlotDto(
    guideId: string,
    start: Date,
    end: Date,
    status: GuideAvailabilitySlotDto['status'],
  ): GuideAvailabilitySlotDto {
    return {
      guideId,
      date: formatScheduleInstant(start).slice(0, 10),
      startDatetime: formatScheduleInstant(start),
      endDatetime: formatScheduleInstant(end),
      status,
    };
  }

  private async listActiveGuides(filters: CalendarFilters): Promise<TourGuides[]> {
    const qb = this.tourGuidesRepository
      .createQueryBuilder('guide')
      .where('guide.deletedAt IS NULL')
      .andWhere('guide.status = :status', { status: 'active' });

    if (filters.organizationId) {
      qb.andWhere('guide.organizationId = :organizationId', {
        organizationId: filters.organizationId,
      });
    }

    if (filters.destinationId) {
      qb.andWhere('JSON_CONTAINS(guide.destinations, :destinationJson)', {
        destinationJson: JSON.stringify(filters.destinationId),
      });
    }

    qb.orderBy('guide.displayName', 'ASC');
    return qb.getMany();
  }

  private async loadUnavailableByGuide(
    guideIds: string[],
    rangeStart: Date,
    rangeEnd: Date,
  ): Promise<Map<string, GuideAvailability[]>> {
    const map = new Map<string, GuideAvailability[]>();
    if (guideIds.length === 0) return map;

    const rows = await this.availabilityRepository
      .createQueryBuilder('slot')
      .where('slot.guideId IN (:...guideIds)', { guideIds })
      .andWhere('slot.deletedAt IS NULL')
      .andWhere('slot.status = :status', { status: 'unavailable' })
      .andWhere('slot.startDatetime < :rangeEnd', { rangeEnd })
      .andWhere('slot.endDatetime > :rangeStart', { rangeStart })
      .getMany();

    for (const row of rows) {
      const list = map.get(row.guideId) ?? [];
      list.push(row);
      map.set(row.guideId, list);
    }

    return map;
  }

  private async loadOccupancyByGuide(
    guideIds: string[],
    rangeStart: Date,
    rangeEnd: Date,
  ): Promise<Map<string, GuideOccupancy[]>> {
    const map = new Map<string, GuideOccupancy[]>();
    if (guideIds.length === 0) return map;

    const assignments = await this.assignmentsRepository
      .createQueryBuilder('assignment')
      .innerJoin(
        Bookings,
        'booking',
        'booking.id = assignment.bookingId AND booking.deletedAt IS NULL',
      )
      .where('assignment.guideId IN (:...guideIds)', { guideIds })
      .andWhere('booking.status NOT IN (:...excludedStatuses)', {
        excludedStatuses: [...OCCUPIED_EXCLUDED_BOOKING_STATUSES],
      })
      .andWhere('assignment.startDatetime < :rangeEnd', { rangeEnd })
      .andWhere('assignment.endDatetime > :rangeStart', { rangeStart })
      .getMany();

    for (const assignment of assignments) {
      const start = parseScheduleInstant(assignment.startDatetime);
      const end = parseScheduleInstant(assignment.endDatetime);
      const entries = map.get(assignment.guideId) ?? [];
      entries.push({
        assignmentId: assignment.id,
        bookingId: assignment.bookingId,
        role: assignment.role,
        start,
        end,
      });
      map.set(assignment.guideId, entries);
    }

    return map;
  }

  private resolveGuideDayStatus(
    guideId: string,
    date: string,
    unavailableByGuide: Map<string, GuideAvailability[]>,
    occupancyByGuide: Map<string, GuideOccupancy[]>,
  ): GuideDayStatus {
    const occupancies = occupancyByGuide.get(guideId) ?? [];
    if (occupancies.some((entry) => overlapsDay(entry.start, entry.end, date))) {
      return 'occupied';
    }

    const unavailableSlots = unavailableByGuide.get(guideId) ?? [];
    if (
      unavailableSlots.some((slot) =>
        overlapsDay(
          parseScheduleInstant(slot.startDatetime),
          parseScheduleInstant(slot.endDatetime),
          date,
        ),
      )
    ) {
      return 'unavailable';
    }

    return 'available';
  }
}
