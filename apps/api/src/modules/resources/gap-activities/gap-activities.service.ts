import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { GapActivities } from '../../../entities/gap-activity.entity';
import { CreateGapActivityDto } from './dto/create-gap-activity.dto';
import { GapActivitiesListQueryDto } from './dto/gap-activities-list-query.dto';
import { UpdateGapActivityDto } from './dto/update-gap-activity.dto';

const MAX_ACTIVITY_IMAGES = 10;

function normalizeImageUrls(
  imageUrls?: string[] | null,
  legacyImageUrl?: string | null,
): string[] {
  const fromArray = (imageUrls ?? [])
    .map((url) => url.trim())
    .filter(Boolean);
  const fromLegacy = legacyImageUrl?.trim() ? [legacyImageUrl.trim()] : [];
  const merged = fromArray.length > 0 ? fromArray : fromLegacy;
  return [...new Set(merged)].slice(0, MAX_ACTIVITY_IMAGES);
}

function toActivityPayload(
  dto: CreateGapActivityDto | UpdateGapActivityDto,
): DeepPartial<GapActivities> {
  const hasImageUrls = Object.prototype.hasOwnProperty.call(dto, 'imageUrls');
  const hasImageUrl = Object.prototype.hasOwnProperty.call(dto, 'imageUrl');

  const payload: DeepPartial<GapActivities> = { ...dto };

  if (hasImageUrls || hasImageUrl) {
    const urls = normalizeImageUrls(dto.imageUrls, dto.imageUrl);
    payload.imageUrls = urls;
    payload.imageUrl = urls[0] ?? null;
  }

  return payload;
}

@Injectable()
export class GapActivitiesService extends CrudService<GapActivities> {
  constructor(
    @InjectRepository(GapActivities)
    private readonly activitiesRepository: Repository<GapActivities>,
  ) {
    super(activitiesRepository);
  }

  createFromDto(
    dto: CreateGapActivityDto,
    actorUserId?: string,
  ): Promise<GapActivities> {
    return super.create(toActivityPayload(dto), actorUserId);
  }

  updateFromDto(
    id: string,
    dto: UpdateGapActivityDto,
    actorUserId?: string,
  ): Promise<GapActivities> {
    return super.update(id, toActivityPayload(dto), actorUserId);
  }

  override async findAll(
    query: GapActivitiesListQueryDto,
  ): Promise<PaginatedResult<GapActivities>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.activitiesRepository
      .createQueryBuilder('activity')
      .where('activity.deletedAt IS NULL');

    const search = query.search?.trim();
    if (search) {
      qb.andWhere(
        '(activity.title LIKE :term OR activity.description LIKE :term)',
        { term: `%${search}%` },
      );
    }

    if (query.locale) {
      qb.andWhere('activity.locale = :locale', { locale: query.locale });
    }

    if (query.status) {
      qb.andWhere('activity.status = :status', { status: query.status });
    }

    qb.orderBy('activity.sortOrder', 'ASC')
      .addOrderBy('activity.title', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data: data.map((activity) => this.withResolvedImageUrls(activity)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  override async findOne(id: string): Promise<GapActivities> {
    const activity = await super.findOne(id);
    return this.withResolvedImageUrls(activity);
  }

  private withResolvedImageUrls(activity: GapActivities): GapActivities {
    const urls = normalizeImageUrls(activity.imageUrls, activity.imageUrl);
    activity.imageUrls = urls;
    activity.imageUrl = urls[0] ?? null;
    return activity;
  }
}
