import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { GapActivities } from '../../../entities/gap-activity.entity';
import { GapImpactStats } from '../../../entities/gap-impact-stat.entity';
import { GapMediaItems } from '../../../entities/gap-media-item.entity';
import { GapPages, type GapPageSectionKey } from '../../../entities/gap-page.entity';
import { GapSiteSettings } from '../../../entities/gap-site-settings.entity';
import { PublicGapLocaleQueryDto } from './dto/public-gap-locale-query.dto';
import { PublicGapMediaListQueryDto } from './dto/public-gap-media-list-query.dto';
import { PublicGapPagesListQueryDto } from './dto/public-gap-pages-list-query.dto';

export type PublicGapSiteSettingsDto = {
  id: string;
  title: string;
  subtitle: string;
  heroImageUrl: string;
  heroImageAlt: string;
  unescoLabel: string | null;
  unescoUrl: string | null;
  donateUrl: string | null;
  donateLabel: string | null;
  locale: string;
};

export type PublicGapPageDto = {
  id: string;
  sectionKey: GapPageSectionKey;
  title: string;
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
  publishedAt: string | null;
  locale: string;
};

export type PublicGapActivityDto = {
  id: string;
  title: string;
  description: string;
  iconKey: 'school' | 'tree' | 'art' | 'park' | 'community';
  imageUrl: string | null;
  sortOrder: number;
  locale: string;
};

export type PublicGapImpactStatDto = {
  id: string;
  label: string;
  valueDisplay: string;
  description: string | null;
  colorKey: 'primary' | 'secondary';
  sortOrder: number;
  locale: string;
};

export type PublicGapMediaItemDto = {
  id: string;
  mediaType: 'image' | 'video';
  title: string;
  description: string | null;
  fileUrl: string | null;
  externalUrl: string | null;
  thumbnailUrl: string | null;
  publishedAt: string | null;
  sortOrder: number;
  locale: string;
};

export type PublicGapHomeDto = {
  settings: PublicGapSiteSettingsDto | null;
  impactStats: PublicGapImpactStatDto[];
};

@Injectable()
export class PublicGapService {
  constructor(
    @InjectRepository(GapSiteSettings)
    private readonly settingsRepository: Repository<GapSiteSettings>,
    @InjectRepository(GapPages)
    private readonly pagesRepository: Repository<GapPages>,
    @InjectRepository(GapActivities)
    private readonly activitiesRepository: Repository<GapActivities>,
    @InjectRepository(GapImpactStats)
    private readonly impactStatsRepository: Repository<GapImpactStats>,
    @InjectRepository(GapMediaItems)
    private readonly mediaItemsRepository: Repository<GapMediaItems>,
  ) {}

  async getHomeContent(query: PublicGapLocaleQueryDto): Promise<PublicGapHomeDto> {
    if (!query.locale) {
      return this.fetchHomeContent();
    }

    const localized = await this.fetchHomeContent(query.locale);
    if (localized.settings && localized.impactStats.length > 0) {
      return localized;
    }

    const fallback = await this.fetchHomeContent();
    return {
      settings: localized.settings ?? fallback.settings,
      impactStats:
        localized.impactStats.length > 0 ? localized.impactStats : fallback.impactStats,
    };
  }

  async listPages(query: PublicGapPagesListQueryDto): Promise<PublicGapPageDto[]> {
    const localized = await this.fetchPublishedPages(query.sectionKey, query.locale);
    if (localized.length > 0 || !query.locale) {
      return localized;
    }
    return this.fetchPublishedPages(query.sectionKey);
  }

  async getPageBySectionKey(
    sectionKey: GapPageSectionKey,
    locale?: string,
  ): Promise<PublicGapPageDto> {
    if (locale) {
      const localized = await this.findPublishedPage(sectionKey, locale);
      if (localized) {
        return this.toPageDto(localized);
      }
    }

    const fallback = await this.findPublishedPage(sectionKey);
    if (!fallback) {
      throw new NotFoundException(`GAP page "${sectionKey}" not found`);
    }

    return this.toPageDto(fallback);
  }

  async listActivities(query: PublicGapLocaleQueryDto): Promise<PublicGapActivityDto[]> {
    let activities = await this.fetchPublishedActivities(query.locale);
    if (activities.length === 0 && query.locale) {
      activities = await this.fetchPublishedActivities();
    }
    return activities;
  }

  async listMedia(
    query: PublicGapMediaListQueryDto,
  ): Promise<PaginatedResult<PublicGapMediaItemDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;

    let result = await this.queryMedia(page, limit, query.mediaType, query.locale);
    if (result.data.length === 0 && query.locale) {
      result = await this.queryMedia(page, limit, query.mediaType);
    }

    return result;
  }

  private async fetchHomeContent(locale?: string): Promise<PublicGapHomeDto> {
    const settingsQb = this.settingsRepository
      .createQueryBuilder('settings')
      .where('settings.deletedAt IS NULL')
      .andWhere('settings.status = :status', { status: 'published' });

    if (locale) {
      settingsQb.andWhere('settings.locale = :locale', { locale });
    }

    const settings = await settingsQb.getOne();

    const statsQb = this.impactStatsRepository
      .createQueryBuilder('stat')
      .where('stat.deletedAt IS NULL')
      .andWhere('stat.status = :status', { status: 'published' });

    if (locale) {
      statsQb.andWhere('stat.locale = :locale', { locale });
    }

    const impactStats = await statsQb
      .orderBy('stat.sortOrder', 'ASC')
      .addOrderBy('stat.label', 'ASC')
      .getMany();

    return {
      settings: settings ? this.toSettingsDto(settings) : null,
      impactStats: impactStats.map((stat) => this.toImpactStatDto(stat)),
    };
  }

  private async fetchPublishedPages(
    sectionKey?: GapPageSectionKey,
    locale?: string,
  ): Promise<PublicGapPageDto[]> {
    const qb = this.publishedPagesQueryBuilder();
    if (sectionKey) {
      qb.andWhere('page.sectionKey = :sectionKey', { sectionKey });
    }
    if (locale) {
      qb.andWhere('page.locale = :locale', { locale });
    }
    qb.orderBy('page.sectionKey', 'ASC').addOrderBy('page.publishedAt', 'DESC');

    const pages = await qb.getMany();
    return pages.map((page) => this.toPageDto(page));
  }

  private async findPublishedPage(
    sectionKey: GapPageSectionKey,
    locale?: string,
  ): Promise<GapPages | null> {
    const qb = this.publishedPagesQueryBuilder().andWhere(
      'page.sectionKey = :sectionKey',
      { sectionKey },
    );

    if (locale) {
      qb.andWhere('page.locale = :locale', { locale });
    } else {
      qb.orderBy('page.publishedAt', 'DESC');
    }

    return qb.getOne();
  }

  private publishedPagesQueryBuilder(): SelectQueryBuilder<GapPages> {
    return this.pagesRepository
      .createQueryBuilder('page')
      .where('page.deletedAt IS NULL')
      .andWhere('page.status = :status', { status: 'published' })
      .andWhere('page.publishedAt IS NOT NULL')
      .andWhere('page.publishedAt <= :now', { now: new Date() });
  }

  private async fetchPublishedActivities(locale?: string): Promise<PublicGapActivityDto[]> {
    const qb = this.activitiesRepository
      .createQueryBuilder('activity')
      .where('activity.deletedAt IS NULL')
      .andWhere('activity.status = :status', { status: 'published' });

    if (locale) {
      qb.andWhere('activity.locale = :locale', { locale });
    }

    const activities = await qb
      .orderBy('activity.sortOrder', 'ASC')
      .addOrderBy('activity.title', 'ASC')
      .getMany();

    return activities.map((activity) => this.toActivityDto(activity));
  }

  private async queryMedia(
    page: number,
    limit: number,
    mediaType?: 'image' | 'video',
    locale?: string,
  ): Promise<PaginatedResult<PublicGapMediaItemDto>> {
    const qb = this.mediaItemsRepository
      .createQueryBuilder('item')
      .where('item.deletedAt IS NULL')
      .andWhere('item.status = :status', { status: 'published' })
      .andWhere('item.publishedAt IS NOT NULL')
      .andWhere('item.publishedAt <= :now', { now: new Date() });

    if (mediaType) {
      qb.andWhere('item.mediaType = :mediaType', { mediaType });
    }

    if (locale) {
      qb.andWhere('item.locale = :locale', { locale });
    }

    qb.orderBy('item.sortOrder', 'ASC')
      .addOrderBy('item.publishedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      data: items.map((item) => this.toMediaItemDto(item)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  private toSettingsDto(settings: GapSiteSettings): PublicGapSiteSettingsDto {
    return {
      id: settings.id,
      title: settings.title,
      subtitle: settings.subtitle,
      heroImageUrl: settings.heroImageUrl,
      heroImageAlt: settings.heroImageAlt,
      unescoLabel: settings.unescoLabel,
      unescoUrl: settings.unescoUrl,
      donateUrl: settings.donateUrl,
      donateLabel: settings.donateLabel,
      locale: settings.locale,
    };
  }

  private toPageDto(page: GapPages): PublicGapPageDto {
    return {
      id: page.id,
      sectionKey: page.sectionKey,
      title: page.title,
      excerpt: page.excerpt,
      content: page.content,
      coverImageUrl: page.coverImageUrl,
      publishedAt: page.publishedAt?.toISOString() ?? null,
      locale: page.locale,
    };
  }

  private toActivityDto(activity: GapActivities): PublicGapActivityDto {
    return {
      id: activity.id,
      title: activity.title,
      description: activity.description,
      iconKey: activity.iconKey,
      imageUrl: activity.imageUrl,
      sortOrder: activity.sortOrder,
      locale: activity.locale,
    };
  }

  private toImpactStatDto(stat: GapImpactStats): PublicGapImpactStatDto {
    return {
      id: stat.id,
      label: stat.label,
      valueDisplay: stat.valueDisplay,
      description: stat.description,
      colorKey: stat.colorKey,
      sortOrder: stat.sortOrder,
      locale: stat.locale,
    };
  }

  private toMediaItemDto(item: GapMediaItems): PublicGapMediaItemDto {
    return {
      id: item.id,
      mediaType: item.mediaType,
      title: item.title,
      description: item.description,
      fileUrl: item.fileUrl,
      externalUrl: item.externalUrl,
      thumbnailUrl: item.thumbnailUrl,
      publishedAt: item.publishedAt?.toISOString() ?? null,
      sortOrder: item.sortOrder,
      locale: item.locale,
    };
  }
}
