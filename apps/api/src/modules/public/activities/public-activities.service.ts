import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import {
  Activities,
  ActivityProviders,
  ActivitySchedules,
  Destinations,
} from '../../../entities/generated';
import { PublicDestinationDto } from '../accommodations/dto/public-destination.dto';
import { ActivityBrowseQueryDto } from './dto/activity-browse-query.dto';
import { ActivityDetailQueryDto } from './dto/activity-detail-query.dto';
import { ActivityDetailDto } from './dto/activity-detail.dto';
import { ActivitySearchQueryDto } from './dto/activity-search-query.dto';
import { ActivitySearchResultDto } from './dto/activity-search-result.dto';
import { parseDateOnly } from './activity-dates.util';

type ScheduleOffer = ActivityDetailDto['schedules'][number];

@Injectable()
export class PublicActivitiesService {
  constructor(
    @InjectRepository(Activities)
    private readonly activitiesRepository: Repository<Activities>,
    @InjectRepository(ActivityProviders)
    private readonly providersRepository: Repository<ActivityProviders>,
    @InjectRepository(ActivitySchedules)
    private readonly schedulesRepository: Repository<ActivitySchedules>,
    @InjectRepository(Destinations)
    private readonly destinationsRepository: Repository<Destinations>,
  ) {}

  async listDestinations(): Promise<PublicDestinationDto[]> {
    const rows = await this.destinationsRepository
      .createQueryBuilder('d')
      .select(['d.id', 'd.name', 'd.countryCode'])
      .innerJoin(
        ActivityProviders,
        'ap',
        'ap.destinationId = d.id AND ap.deletedAt IS NULL',
      )
      .innerJoin(
        Activities,
        'a',
        'a.providerId = ap.id AND a.deletedAt IS NULL',
      )
      .where('d.deletedAt IS NULL')
      .distinct(true)
      .orderBy('d.name', 'ASC')
      .getMany();

    return rows.map((d) => ({
      id: d.id,
      name: d.name,
      countryCode: d.countryCode,
    }));
  }

  async browse(
    query: ActivityBrowseQueryDto,
  ): Promise<PaginatedResult<ActivitySearchResultDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const participants = query.participants ?? 1;

    let activeProviders: ActivityProviders[];

    if (query.destination?.trim()) {
      const destinationIds = await this.resolveDestinationIds(query.destination);
      if (!destinationIds.length) {
        return this.emptyPage(page, limit);
      }

      const providers = await this.providersRepository.find({
        where: { destinationId: In(destinationIds) },
      });
      activeProviders = providers.filter((p) => !p.deletedAt);
    } else {
      const providers = await this.providersRepository.find();
      activeProviders = providers.filter((p) => !p.deletedAt);
    }

    if (!activeProviders.length) {
      return this.emptyPage(page, limit);
    }

    const providerById = new Map(activeProviders.map((p) => [p.id, p]));
    const providerIds = activeProviders.map((p) => p.id);

    const activities = await this.activitiesRepository.find({
      where: { providerId: In(providerIds) },
    });
    const activeActivities = activities.filter((a) => !a.deletedAt);
    if (!activeActivities.length) {
      return this.emptyPage(page, limit);
    }

    const destIds = [...new Set(activeProviders.map((p) => p.destinationId))];
    const destinations = await this.destinationsRepository.find({
      where: { id: In(destIds) },
    });
    const destinationById = new Map(
      destinations.filter((d) => !d.deletedAt).map((d) => [d.id, d.name]),
    );

    const activityIds = activeActivities.map((a) => a.id);
    const schedules = await this.schedulesRepository
      .createQueryBuilder('schedule')
      .where('schedule.activityId IN (:...activityIds)', { activityIds })
      .andWhere('schedule.deletedAt IS NULL')
      .andWhere('schedule.startDatetime >= NOW()')
      .orderBy('schedule.startDatetime', 'ASC')
      .getMany();

    const schedulesByActivityId = new Map<string, ActivitySchedules[]>();
    for (const schedule of schedules) {
      const list = schedulesByActivityId.get(schedule.activityId) ?? [];
      list.push(schedule);
      schedulesByActivityId.set(schedule.activityId, list);
    }

    const results: ActivitySearchResultDto[] = [];

    for (const activity of activeActivities) {
      const provider = providerById.get(activity.providerId);
      if (!provider) {
        continue;
      }

      const activitySchedules = schedulesByActivityId.get(activity.id) ?? [];
      const availableSchedules = activitySchedules.filter(
        (schedule) => this.remainingPlaces(schedule) >= participants,
      );

      const result: ActivitySearchResultDto = {
        id: activity.id,
        title: activity.title,
        durationMinutes: activity.durationMinutes,
        priceCents: activity.priceCents,
        currency: activity.currency,
        destination: destinationById.get(provider.destinationId) ?? '',
        providerName: provider.name,
        availableSchedulesCount: availableSchedules.length,
      };

      if (availableSchedules[0]) {
        result.nextStartDatetime = this.toIsoDatetime(
          availableSchedules[0].startDatetime,
        );
      }

      results.push(result);
    }

    results.sort((a, b) => a.priceCents - b.priceCents);

    const total = results.length;
    const offset = (page - 1) * limit;
    const data = results.slice(offset, offset + limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async search(
    query: ActivitySearchQueryDto,
  ): Promise<PaginatedResult<ActivitySearchResultDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const participants = query.participants ?? 1;

    parseDateOnly(query.date);

    const destinationIds = await this.resolveDestinationIds(query.destination);
    if (!destinationIds.length) {
      return this.emptyPage(page, limit);
    }

    const providers = await this.providersRepository.find({
      where: { destinationId: In(destinationIds) },
    });
    const activeProviders = providers.filter((p) => !p.deletedAt);
    if (!activeProviders.length) {
      return this.emptyPage(page, limit);
    }

    const providerById = new Map(activeProviders.map((p) => [p.id, p]));
    const providerIds = activeProviders.map((p) => p.id);

    const activities = await this.activitiesRepository.find({
      where: { providerId: In(providerIds) },
    });
    const activeActivities = activities.filter((a) => !a.deletedAt);
    if (!activeActivities.length) {
      return this.emptyPage(page, limit);
    }

    const destIds = [...new Set(activeProviders.map((p) => p.destinationId))];
    const destinations = await this.destinationsRepository.find({
      where: { id: In(destIds) },
    });
    const destinationById = new Map(
      destinations.filter((d) => !d.deletedAt).map((d) => [d.id, d.name]),
    );

    const activityIds = activeActivities.map((a) => a.id);
    const schedules = await this.schedulesRepository
      .createQueryBuilder('schedule')
      .where('schedule.activityId IN (:...activityIds)', { activityIds })
      .andWhere('schedule.deletedAt IS NULL')
      .andWhere('DATE(schedule.startDatetime) = :date', { date: query.date })
      .orderBy('schedule.startDatetime', 'ASC')
      .getMany();

    const schedulesByActivityId = new Map<string, ActivitySchedules[]>();
    for (const schedule of schedules) {
      if (this.remainingPlaces(schedule) < participants) {
        continue;
      }
      const list = schedulesByActivityId.get(schedule.activityId) ?? [];
      list.push(schedule);
      schedulesByActivityId.set(schedule.activityId, list);
    }

    const results: ActivitySearchResultDto[] = [];

    for (const activity of activeActivities) {
      const availableSchedules = schedulesByActivityId.get(activity.id);
      if (!availableSchedules?.length) {
        continue;
      }

      const provider = providerById.get(activity.providerId);
      if (!provider) {
        continue;
      }

      const destinationName =
        destinationById.get(provider.destinationId) ?? query.destination.trim();

      results.push({
        id: activity.id,
        title: activity.title,
        durationMinutes: activity.durationMinutes,
        priceCents: activity.priceCents,
        currency: activity.currency,
        destination: destinationName,
        providerName: provider.name,
        availableSchedulesCount: availableSchedules.length,
        nextStartDatetime: this.toIsoDatetime(availableSchedules[0].startDatetime),
      });
    }

    results.sort((a, b) => a.priceCents - b.priceCents);

    const total = results.length;
    const offset = (page - 1) * limit;
    const data = results.slice(offset, offset + limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getById(
    id: string,
    query: ActivityDetailQueryDto,
  ): Promise<ActivityDetailDto> {
    const participants = query.participants ?? 1;
    parseDateOnly(query.date);

    const activity = await this.activitiesRepository.findOne({ where: { id } });
    if (!activity || activity.deletedAt) {
      throw new NotFoundException('Activité introuvable.');
    }

    const provider = await this.providersRepository.findOne({
      where: { id: activity.providerId },
    });
    if (!provider || provider.deletedAt) {
      throw new NotFoundException('Activité introuvable.');
    }

    const destination = await this.destinationsRepository.findOne({
      where: { id: provider.destinationId },
    });
    if (!destination || destination.deletedAt) {
      throw new NotFoundException('Activité introuvable.');
    }

    const schedules = await this.buildAvailableSchedules(
      activity.id,
      query.date,
      participants,
      activity.priceCents,
      activity.currency,
    );
    if (!schedules.length) {
      throw new NotFoundException(
        'Aucun créneau disponible pour cette date et ce nombre de participants.',
      );
    }

    return {
      id: activity.id,
      title: activity.title,
      description: activity.description,
      durationMinutes: activity.durationMinutes,
      priceCents: activity.priceCents,
      currency: activity.currency,
      destination: destination.name,
      providerName: provider.name,
      date: query.date,
      participants,
      schedules,
    };
  }

  private async resolveDestinationIds(destination: string): Promise<string[]> {
    const term = destination.trim();
    if (!term) {
      return [];
    }

    const rows = await this.destinationsRepository
      .createQueryBuilder('d')
      .select('d.id')
      .where('d.deletedAt IS NULL')
      .andWhere('LOWER(d.name) LIKE :pattern', {
        pattern: `%${term.toLowerCase()}%`,
      })
      .getMany();

    return rows.map((d) => d.id);
  }

  private async buildAvailableSchedules(
    activityId: string,
    date: string,
    participants: number,
    priceCents: number,
    currency: string,
  ): Promise<ScheduleOffer[]> {
    const rows = await this.schedulesRepository
      .createQueryBuilder('schedule')
      .where('schedule.activityId = :activityId', { activityId })
      .andWhere('schedule.deletedAt IS NULL')
      .andWhere('DATE(schedule.startDatetime) = :date', { date })
      .orderBy('schedule.startDatetime', 'ASC')
      .getMany();

    const offers: ScheduleOffer[] = [];
    for (const schedule of rows) {
      const remainingPlaces = this.remainingPlaces(schedule);
      if (remainingPlaces < participants) {
        continue;
      }
      offers.push({
        scheduleId: schedule.id,
        startDatetime: this.toIsoDatetime(schedule.startDatetime),
        capacity: schedule.capacity,
        bookedCount: schedule.bookedCount,
        remainingPlaces,
        priceCents,
        currency,
      });
    }
    return offers;
  }

  private remainingPlaces(schedule: ActivitySchedules): number {
    return schedule.capacity - schedule.bookedCount;
  }

  private toIsoDatetime(value: Date | string): string {
    return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
  }

  private emptyPage(
    page: number,
    limit: number,
  ): PaginatedResult<ActivitySearchResultDto> {
    return {
      data: [],
      meta: { total: 0, page, limit, totalPages: 1 },
    };
  }
}
