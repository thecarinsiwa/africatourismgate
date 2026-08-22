import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { newId } from '../../../common/utils/uuid';
import {
  BookingGuideAssignments,
  BookingItems,
  Bookings,
  GuideAvailability,
  TourGuides,
} from '../../../entities/generated';
import { enumerateMonthDays } from '../../public/accommodations/stay-dates.util';
import { enumerateDates } from '../room-availability/room-availability-date.util';
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
import { TourGuidesService } from './tour-guides.service';

const OCCUPIED_EXCLUDED_BOOKING_STATUSES = ['cancelled', 'refunded', 'draft'] as const;

type CalendarFilters = {
  destinationId?: string;
  organizationId?: string;
};

type GuideDayStatus = 'available' | 'occupied' | 'unavailable';

type GuideOccupancy = {
  bookingId: string;
  role: BookingGuideAssignments['role'];
  dates: Set<string>;
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
    @InjectRepository(BookingItems)
    private readonly bookingItemsRepository: Repository<BookingItems>,
    private readonly tourGuidesService: TourGuidesService,
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
    const unavailableByGuide = await this.loadUnavailableDatesByGuide(
      guideIds,
      days[0]!,
      days[days.length - 1]!,
    );
    const occupancyByGuide = await this.loadOccupancyByGuide(guideIds, days[0]!, days[days.length - 1]!);

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
    const unavailableByGuide = await this.loadUnavailableDatesByGuide(guideIds, date, date);
    const occupancyByGuide = await this.loadOccupancyByGuide(guideIds, date, date);

    const guideRows: TourGuideCalendarDayGuideDto[] = guides.map((guide) => {
      const status = this.resolveGuideDayStatus(
        guide.id,
        date,
        unavailableByGuide,
        occupancyByGuide,
      );
      const occupancy = occupancyByGuide.get(guide.id)?.find((entry) => entry.dates.has(date));

      return {
        guideId: guide.id,
        displayName: guide.displayName,
        photoUrl: guide.photoUrl,
        status,
        ...(occupancy
          ? { bookingId: occupancy.bookingId, role: occupancy.role }
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
    const date = dto.date.slice(0, 10);

    if (dto.status === 'available') {
      const existing = await this.availabilityRepository.findOne({
        where: { guideId, date },
      });
      if (existing) {
        await this.availabilityRepository.softDelete(existing.id);
        await this.availabilityRepository.update(existing.id, {
          deletedByUserId: actorUserId,
        });
      }
      return { guideId, date, status: 'available' };
    }

    const existing = await this.availabilityRepository.findOne({
      where: { guideId, date },
      withDeleted: true,
    });

    if (existing) {
      if (existing.deletedAt) {
        await this.availabilityRepository.recover(existing);
      }
      existing.status = 'unavailable';
      existing.updatedByUserId = actorUserId;
      await this.availabilityRepository.save(existing);
      return { guideId, date, status: 'unavailable' };
    }

    const created = this.availabilityRepository.create({
      id: newId(),
      guideId,
      date,
      status: 'unavailable',
      createdByUserId: actorUserId,
    });
    await this.availabilityRepository.save(created);
    return { guideId, date, status: 'unavailable' };
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

  private async loadUnavailableDatesByGuide(
    guideIds: string[],
    dateFrom: string,
    dateTo: string,
  ): Promise<Map<string, Set<string>>> {
    const map = new Map<string, Set<string>>();
    if (guideIds.length === 0) return map;

    const rows = await this.availabilityRepository
      .createQueryBuilder('slot')
      .where('slot.guideId IN (:...guideIds)', { guideIds })
      .andWhere('slot.deletedAt IS NULL')
      .andWhere('slot.status = :status', { status: 'unavailable' })
      .andWhere('slot.date >= :dateFrom', { dateFrom })
      .andWhere('slot.date <= :dateTo', { dateTo })
      .getMany();

    for (const row of rows) {
      const dates = map.get(row.guideId) ?? new Set<string>();
      dates.add(row.date.slice(0, 10));
      map.set(row.guideId, dates);
    }

    return map;
  }

  private async loadOccupancyByGuide(
    guideIds: string[],
    dateFrom: string,
    dateTo: string,
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
      .getMany();

    if (assignments.length === 0) return map;

    const bookingIds = [...new Set(assignments.map((row) => row.bookingId))];
    const items = await this.bookingItemsRepository.find({
      where: { bookingId: In(bookingIds), deletedAt: IsNull() },
    });
    const itemsByBookingId = new Map<string, BookingItems[]>();
    for (const item of items) {
      const list = itemsByBookingId.get(item.bookingId) ?? [];
      list.push(item);
      itemsByBookingId.set(item.bookingId, list);
    }

    for (const assignment of assignments) {
      const bookingItems = itemsByBookingId.get(assignment.bookingId) ?? [];
      const visitRange = deriveVisitDateRange(bookingItems);
      if (!visitRange) continue;

      let visitDates: string[];
      try {
        visitDates = enumerateDates(visitRange.start, visitRange.end);
      } catch {
        continue;
      }

      const dates = new Set<string>();
      for (const date of visitDates) {
        if (date >= dateFrom && date <= dateTo) {
          dates.add(date);
        }
      }
      if (dates.size === 0) continue;

      const entries = map.get(assignment.guideId) ?? [];
      entries.push({
        bookingId: assignment.bookingId,
        role: assignment.role,
        dates,
      });
      map.set(assignment.guideId, entries);
    }

    return map;
  }

  private resolveGuideDayStatus(
    guideId: string,
    date: string,
    unavailableByGuide: Map<string, Set<string>>,
    occupancyByGuide: Map<string, GuideOccupancy[]>,
  ): GuideDayStatus {
    const occupancies = occupancyByGuide.get(guideId) ?? [];
    if (occupancies.some((entry) => entry.dates.has(date))) {
      return 'occupied';
    }
    if (unavailableByGuide.get(guideId)?.has(date)) {
      return 'unavailable';
    }
    return 'available';
  }
}

function deriveVisitDateRange(items: BookingItems[]): { start: string; end: string } | null {
  const startDates = items
    .map((item) => item.startDate?.slice(0, 10))
    .filter((value): value is string => Boolean(value))
    .sort();
  const endDates = items
    .map((item) => (item.endDate ?? item.startDate)?.slice(0, 10))
    .filter((value): value is string => Boolean(value))
    .sort();

  const start = startDates[0];
  const end = endDates[endDates.length - 1];
  if (!start || !end) return null;
  return { start, end };
}
