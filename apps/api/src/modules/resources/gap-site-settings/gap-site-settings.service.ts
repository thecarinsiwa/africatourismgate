import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import {
  GapSiteSettings,
  type GapSiteLink,
} from '../../../entities/gap-site-settings.entity';
import { CreateGapSiteSettingsDto } from './dto/create-gap-site-settings.dto';
import { GapSiteSettingsListQueryDto } from './dto/gap-site-settings-list-query.dto';
import { UpdateGapSiteSettingsDto } from './dto/update-gap-site-settings.dto';

const MAX_SITE_LINKS = 10;

function normalizeSiteLinks(
  links?: Array<{ label?: string | null; url?: string | null }> | null,
  legacyLabel?: string | null,
  legacyUrl?: string | null,
): GapSiteLink[] {
  const fromArray = (links ?? [])
    .map((item) => {
      const label = item.label?.trim() ?? '';
      const url = item.url?.trim() || null;
      if (!label) return null;
      return { label, url } satisfies GapSiteLink;
    })
    .filter((item): item is GapSiteLink => item !== null);

  if (fromArray.length > 0) {
    return fromArray.slice(0, MAX_SITE_LINKS);
  }

  const legacy = legacyLabel?.trim();
  if (!legacy) return [];
  return [{ label: legacy, url: legacyUrl?.trim() || null }];
}

@Injectable()
export class GapSiteSettingsService extends CrudService<GapSiteSettings> {
  constructor(
    @InjectRepository(GapSiteSettings)
    private readonly settingsRepository: Repository<GapSiteSettings>,
  ) {
    super(settingsRepository);
  }

  createFromDto(
    dto: CreateGapSiteSettingsDto,
    actorUserId?: string,
  ): Promise<GapSiteSettings> {
    return super.create(this.toEntityPayload(dto), actorUserId);
  }

  updateFromDto(
    id: string,
    dto: UpdateGapSiteSettingsDto,
    actorUserId?: string,
  ): Promise<GapSiteSettings> {
    return super.update(id, this.toEntityPayload(dto), actorUserId);
  }

  private toEntityPayload(
    dto: CreateGapSiteSettingsDto | UpdateGapSiteSettingsDto,
  ): DeepPartial<GapSiteSettings> {
    const hasLinks = Object.prototype.hasOwnProperty.call(dto, 'links');
    const hasUnescoLabel = Object.prototype.hasOwnProperty.call(dto, 'unescoLabel');
    const hasUnescoUrl = Object.prototype.hasOwnProperty.call(dto, 'unescoUrl');

    const payload: DeepPartial<GapSiteSettings> = { ...dto };

    if (hasLinks || hasUnescoLabel || hasUnescoUrl) {
      const links = normalizeSiteLinks(dto.links, dto.unescoLabel, dto.unescoUrl);
      payload.links = links;
      // Keep legacy columns in sync with the first link for older consumers.
      payload.unescoLabel = links[0]?.label ?? null;
      payload.unescoUrl = links[0]?.url ?? null;
    }

    return payload;
  }

  override async findAll(
    query: GapSiteSettingsListQueryDto,
  ): Promise<PaginatedResult<GapSiteSettings>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.settingsRepository
      .createQueryBuilder('settings')
      .where('settings.deletedAt IS NULL');

    if (query.locale) {
      qb.andWhere('settings.locale = :locale', { locale: query.locale });
    }

    if (query.status) {
      qb.andWhere('settings.status = :status', { status: query.status });
    }

    qb.orderBy('settings.locale', 'ASC').skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data: data.map((item) => this.withResolvedLinks(item)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  override async findOne(id: string): Promise<GapSiteSettings> {
    const settings = await super.findOne(id);
    return this.withResolvedLinks(settings);
  }

  private withResolvedLinks(settings: GapSiteSettings): GapSiteSettings {
    const links = normalizeSiteLinks(
      settings.links,
      settings.unescoLabel,
      settings.unescoUrl,
    );
    settings.links = links;
    settings.unescoLabel = links[0]?.label ?? null;
    settings.unescoUrl = links[0]?.url ?? null;
    return settings;
  }
}
