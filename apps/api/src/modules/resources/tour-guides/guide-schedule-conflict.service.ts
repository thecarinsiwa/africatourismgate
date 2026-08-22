import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BookingGuideAssignments,
  Bookings,
  GuideAvailability,
  TourGuides,
} from '../../../entities/generated';
import {
  assertValidInterval,
  formatScheduleInstant,
  intervalsOverlap,
  parseScheduleInstant,
} from './guide-schedule.util';

const OCCUPIED_EXCLUDED_BOOKING_STATUSES = ['cancelled', 'refunded', 'draft'] as const;

export type GuideScheduleConflictKind = 'assignment' | 'unavailability';

export interface GuideScheduleConflict {
  kind: GuideScheduleConflictKind;
  id: string;
  guideId: string;
  bookingId?: string;
  startDatetime: string;
  endDatetime: string;
}

export type GuideScheduleConflictOptions = {
  excludeAssignmentId?: string;
  excludeAvailabilityId?: string;
};

export type GuideScheduleBatchSlot = {
  guideId: string;
  start: Date;
  end: Date;
  label?: string;
};

@Injectable()
export class GuideScheduleConflictService {
  constructor(
    @InjectRepository(BookingGuideAssignments)
    private readonly assignmentsRepository: Repository<BookingGuideAssignments>,
    @InjectRepository(GuideAvailability)
    private readonly availabilityRepository: Repository<GuideAvailability>,
    @InjectRepository(TourGuides)
    private readonly tourGuidesRepository: Repository<TourGuides>,
  ) {}

  parseRange(start: string | Date, end: string | Date): { start: Date; end: Date } {
    const startAt = parseScheduleInstant(start);
    const endAt = parseScheduleInstant(end);
    assertValidInterval(startAt, endAt);
    return { start: startAt, end: endAt };
  }

  assertNoInternalBatchOverlaps(slots: GuideScheduleBatchSlot[]): void {
    const byGuide = new Map<string, GuideScheduleBatchSlot[]>();
    for (const slot of slots) {
      const list = byGuide.get(slot.guideId) ?? [];
      list.push(slot);
      byGuide.set(slot.guideId, list);
    }

    for (const [guideId, guideSlots] of byGuide) {
      for (let i = 0; i < guideSlots.length; i += 1) {
        for (let j = i + 1; j < guideSlots.length; j += 1) {
          const left = guideSlots[i]!;
          const right = guideSlots[j]!;
          if (intervalsOverlap(left.start, left.end, right.start, right.end)) {
            throw new ConflictException({
              message: 'Chevauchement entre créneaux de la même requête.',
              guideId,
              conflicts: [
                {
                  kind: 'assignment' as const,
                  label: left.label,
                  startDatetime: formatScheduleInstant(left.start),
                  endDatetime: formatScheduleInstant(left.end),
                },
                {
                  kind: 'assignment' as const,
                  label: right.label,
                  startDatetime: formatScheduleInstant(right.start),
                  endDatetime: formatScheduleInstant(right.end),
                },
              ],
            });
          }
        }
      }
    }
  }

  async findConflicts(
    guideId: string,
    start: Date,
    end: Date,
    options?: GuideScheduleConflictOptions,
  ): Promise<GuideScheduleConflict[]> {
    const [assignmentConflicts, unavailabilityConflicts] = await Promise.all([
      this.findAssignmentConflicts(guideId, start, end, options?.excludeAssignmentId),
      this.findUnavailabilityConflicts(guideId, start, end, options?.excludeAvailabilityId),
    ]);
    return [...assignmentConflicts, ...unavailabilityConflicts];
  }

  async assertNoConflicts(
    guideId: string,
    start: Date,
    end: Date,
    options?: GuideScheduleConflictOptions,
  ): Promise<void> {
    const conflicts = await this.findConflicts(guideId, start, end, options);
    if (conflicts.length === 0) {
      return;
    }

    throw new ConflictException({
      message: 'Le guide n\'est pas disponible sur cette plage horaire.',
      guideId,
      conflicts,
    });
  }

  /** Assignation : conflits avec autres missions et indisponibilités. */
  async assertAssignable(
    guideId: string,
    start: Date,
    end: Date,
    options?: GuideScheduleConflictOptions,
  ): Promise<void> {
    await this.assertNoConflicts(guideId, start, end, options);
  }

  /** Indisponibilité manuelle : conflit uniquement avec missions actives. */
  async assertCanMarkUnavailable(
    guideId: string,
    start: Date,
    end: Date,
    options?: GuideScheduleConflictOptions,
  ): Promise<void> {
    const assignmentConflicts = await this.findAssignmentConflicts(
      guideId,
      start,
      end,
      options?.excludeAssignmentId,
    );
    if (assignmentConflicts.length > 0) {
      throw new ConflictException({
        message: 'Impossible de marquer indisponible : le guide a une mission sur cette plage.',
        guideId,
        conflicts: assignmentConflicts,
      });
    }

    const unavailabilityConflicts = await this.findUnavailabilityConflicts(
      guideId,
      start,
      end,
      options?.excludeAvailabilityId,
    );
    if (unavailabilityConflicts.length > 0) {
      throw new ConflictException({
        message: 'Chevauchement avec une indisponibilité existante.',
        guideId,
        conflicts: unavailabilityConflicts,
      });
    }
  }

  async listAvailableGuideIds(
    start: Date,
    end: Date,
    filters?: { destinationId?: string; organizationId?: string },
  ): Promise<string[]> {
    const qb = this.tourGuidesRepository
      .createQueryBuilder('guide')
      .select('guide.id', 'id')
      .where('guide.deletedAt IS NULL')
      .andWhere('guide.status = :status', { status: 'active' });

    if (filters?.organizationId) {
      qb.andWhere('guide.organizationId = :organizationId', {
        organizationId: filters.organizationId,
      });
    }

    if (filters?.destinationId) {
      qb.andWhere('JSON_CONTAINS(guide.destinations, :destinationJson)', {
        destinationJson: JSON.stringify(filters.destinationId),
      });
    }

    const rows = await qb.getRawMany<{ id: string }>();
    const available: string[] = [];

    for (const row of rows) {
      const conflicts = await this.findConflicts(row.id, start, end);
      if (conflicts.length === 0) {
        available.push(row.id);
      }
    }

    return available;
  }

  private async findAssignmentConflicts(
    guideId: string,
    start: Date,
    end: Date,
    excludeAssignmentId?: string,
  ): Promise<GuideScheduleConflict[]> {
    const qb = this.assignmentsRepository
      .createQueryBuilder('assignment')
      .innerJoin(
        Bookings,
        'booking',
        'booking.id = assignment.bookingId AND booking.deletedAt IS NULL',
      )
      .where('assignment.guideId = :guideId', { guideId })
      .andWhere('booking.status NOT IN (:...excludedStatuses)', {
        excludedStatuses: [...OCCUPIED_EXCLUDED_BOOKING_STATUSES],
      })
      .andWhere('assignment.startDatetime < :end', { end })
      .andWhere('assignment.endDatetime > :start', { start });

    if (excludeAssignmentId) {
      qb.andWhere('assignment.id != :excludeAssignmentId', { excludeAssignmentId });
    }

    const rows = await qb.getMany();
    return rows.map((row) => ({
      kind: 'assignment' as const,
      id: row.id,
      guideId: row.guideId,
      bookingId: row.bookingId,
      startDatetime: formatScheduleInstant(parseScheduleInstant(row.startDatetime)),
      endDatetime: formatScheduleInstant(parseScheduleInstant(row.endDatetime)),
    }));
  }

  private async findUnavailabilityConflicts(
    guideId: string,
    start: Date,
    end: Date,
    excludeAvailabilityId?: string,
  ): Promise<GuideScheduleConflict[]> {
    const qb = this.availabilityRepository
      .createQueryBuilder('slot')
      .where('slot.guideId = :guideId', { guideId })
      .andWhere('slot.deletedAt IS NULL')
      .andWhere('slot.status = :status', { status: 'unavailable' })
      .andWhere('slot.startDatetime < :end', { end })
      .andWhere('slot.endDatetime > :start', { start });

    if (excludeAvailabilityId) {
      qb.andWhere('slot.id != :excludeAvailabilityId', { excludeAvailabilityId });
    }

    const rows = await qb.getMany();
    return rows.map((row) => ({
      kind: 'unavailability' as const,
      id: row.id,
      guideId: row.guideId,
      startDatetime: formatScheduleInstant(parseScheduleInstant(row.startDatetime)),
      endDatetime: formatScheduleInstant(parseScheduleInstant(row.endDatetime)),
    }));
  }
}
