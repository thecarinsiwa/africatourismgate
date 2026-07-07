import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import {
  AboutPages,
  type AboutPageSectionKey,
} from '../../../entities/about-page.entity';
import { AboutTimelineMilestones } from '../../../entities/about-timeline-milestone.entity';
import { AboutResources } from '../../../entities/about-resource.entity';
import { TeamMembers } from '../../../entities/team-member.entity';
import { WhyUsItems } from '../../../entities/why-us-item.entity';
import { WhyUsSections } from '../../../entities/why-us-section.entity';
import { HappyCustomersSections } from '../../../entities/happy-customers-section.entity';
import { HappyCustomersStats } from '../../../entities/happy-customers-stat.entity';
import { HeroSlides } from '../../../entities/hero-slide.entity';
import { PublicAboutPagesListQueryDto } from './dto/public-about-pages-list-query.dto';
import { PublicAboutResourcesListQueryDto } from './dto/public-about-resources-list-query.dto';
import { PublicAboutTimelineMilestonesListQueryDto } from './dto/public-about-timeline-milestones-list-query.dto';
import { PublicTeamMembersListQueryDto } from './dto/public-team-members-list-query.dto';
import { PublicWhyUsListQueryDto } from './dto/public-why-us-list-query.dto';
import { PublicHappyCustomersListQueryDto } from './dto/public-happy-customers-list-query.dto';
import { PublicHeroSlidesListQueryDto } from './dto/public-hero-slides-list-query.dto';

export type PublicAboutPageDto = {
  id: string;
  sectionKey: AboutPageSectionKey;
  title: string;
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
  publishedAt: string | null;
  locale: string;
};

export type PublicTeamMemberDto = {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  photoUrl: string | null;
  sortOrder: number;
  locale: string;
};

export type PublicAboutResourceDto = {
  id: string;
  type: 'financial' | 'media';
  title: string;
  description: string | null;
  fileUrl: string | null;
  externalUrl: string | null;
  publishedAt: string | null;
  sortOrder: number;
  locale: string;
};

export type PublicWhyUsSectionDto = {
  id: string;
  title: string;
  subtitle: string;
  locale: string;
};

export type PublicWhyUsItemDto = {
  id: string;
  title: string;
  description: string;
  linkUrl: string;
  iconKey: 'globe' | 'search' | 'booking' | 'support';
  sortOrder: number;
  locale: string;
};

export type PublicWhyUsContentDto = {
  section: PublicWhyUsSectionDto | null;
  items: PublicWhyUsItemDto[];
};

export type PublicHappyCustomersSectionDto = {
  id: string;
  title: string;
  subtitle: string;
  paragraph1: string;
  paragraph2: string;
  imageUrl: string;
  imageAlt: string;
  badgeValue: string;
  badgeLabel: string;
  locale: string;
};

export type PublicHappyCustomersStatDto = {
  id: string;
  label: string;
  percentValue: number;
  colorKey: 'primary' | 'secondary';
  sortOrder: number;
  locale: string;
};

export type PublicHappyCustomersContentDto = {
  section: PublicHappyCustomersSectionDto | null;
  stats: PublicHappyCustomersStatDto[];
};

export type PublicHeroSlideDto = {
  id: string;
  subtitle: string;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  href: string | null;
  sortOrder: number;
  locale: string;
};

export type PublicAboutTimelineMilestoneDto = {
  id: string;
  periodLabel: string;
  periodTitle: string;
  periodSortOrder: number;
  year: number;
  title: string;
  excerpt: string | null;
  content: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  sortOrder: number;
  locale: string;
};

@Injectable()
export class PublicAboutService {
  constructor(
    @InjectRepository(AboutPages)
    private readonly aboutPagesRepository: Repository<AboutPages>,
    @InjectRepository(TeamMembers)
    private readonly teamMembersRepository: Repository<TeamMembers>,
    @InjectRepository(AboutResources)
    private readonly aboutResourcesRepository: Repository<AboutResources>,
    @InjectRepository(AboutTimelineMilestones)
    private readonly timelineMilestonesRepository: Repository<AboutTimelineMilestones>,
    @InjectRepository(WhyUsSections)
    private readonly whyUsSectionsRepository: Repository<WhyUsSections>,
    @InjectRepository(WhyUsItems)
    private readonly whyUsItemsRepository: Repository<WhyUsItems>,
    @InjectRepository(HappyCustomersSections)
    private readonly happyCustomersSectionsRepository: Repository<HappyCustomersSections>,
    @InjectRepository(HappyCustomersStats)
    private readonly happyCustomersStatsRepository: Repository<HappyCustomersStats>,
    @InjectRepository(HeroSlides)
    private readonly heroSlidesRepository: Repository<HeroSlides>,
  ) {}

  async listPages(
    query: PublicAboutPagesListQueryDto,
  ): Promise<PublicAboutPageDto[]> {
    const localized = await this.fetchPublishedPages(query.sectionKey, query.locale);
    if (localized.length > 0 || !query.locale) {
      return localized;
    }
    return this.fetchPublishedPages(query.sectionKey);
  }

  async getPageBySectionKey(
    sectionKey: AboutPageSectionKey,
    locale?: string,
  ): Promise<PublicAboutPageDto> {
    if (locale) {
      const localized = await this.findPublishedPage(sectionKey, locale);
      if (localized) {
        return this.toAboutPageDto(localized);
      }
    }

    const fallback = await this.findPublishedPage(sectionKey);
    if (!fallback) {
      throw new NotFoundException(`About page "${sectionKey}" not found`);
    }

    return this.toAboutPageDto(fallback);
  }

  async listTeamMembers(
    query: PublicTeamMembersListQueryDto,
  ): Promise<PaginatedResult<PublicTeamMemberDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;

    let result = await this.queryTeamMembers(page, limit, query.locale);
    if (result.data.length === 0 && query.locale) {
      result = await this.queryTeamMembers(page, limit);
    }

    return result;
  }

  async listResources(
    query: PublicAboutResourcesListQueryDto,
  ): Promise<PaginatedResult<PublicAboutResourceDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;

    let result = await this.queryResources(page, limit, query.type, query.locale);
    if (result.data.length === 0 && query.locale) {
      result = await this.queryResources(page, limit, query.type);
    }

    return result;
  }

  async getWhyUsContent(query: PublicWhyUsListQueryDto): Promise<PublicWhyUsContentDto> {
    let content = await this.fetchWhyUsContent(query.locale);
    if ((!content.section || content.items.length === 0) && query.locale) {
      content = await this.fetchWhyUsContent();
    }
    return content;
  }

  async getHappyCustomersContent(
    query: PublicHappyCustomersListQueryDto,
  ): Promise<PublicHappyCustomersContentDto> {
    let content = await this.fetchHappyCustomersContent(query.locale);
    if ((!content.section || content.stats.length === 0) && query.locale) {
      content = await this.fetchHappyCustomersContent();
    }
    return content;
  }

  async listHeroSlides(query: PublicHeroSlidesListQueryDto): Promise<PublicHeroSlideDto[]> {
    let slides = await this.fetchPublishedHeroSlides(query.locale);
    if (slides.length === 0 && query.locale) {
      slides = await this.fetchPublishedHeroSlides();
    }
    return slides;
  }

  async listTimelineMilestones(
    query: PublicAboutTimelineMilestonesListQueryDto,
  ): Promise<PaginatedResult<PublicAboutTimelineMilestoneDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 100;

    let result = await this.queryTimelineMilestones(page, limit, query.locale);
    if (result.data.length === 0 && query.locale) {
      result = await this.queryTimelineMilestones(page, limit);
    }

    return result;
  }

  private async fetchPublishedPages(
    sectionKey?: AboutPageSectionKey,
    locale?: string,
  ): Promise<PublicAboutPageDto[]> {
    const qb = this.publishedPagesQueryBuilder();
    if (sectionKey) {
      qb.andWhere('page.sectionKey = :sectionKey', { sectionKey });
    }
    if (locale) {
      qb.andWhere('page.locale = :locale', { locale });
    }
    qb.orderBy('page.sectionKey', 'ASC').addOrderBy('page.publishedAt', 'DESC');

    const pages = await qb.getMany();
    return pages.map((page) => this.toAboutPageDto(page));
  }

  private async findPublishedPage(
    sectionKey: AboutPageSectionKey,
    locale?: string,
  ): Promise<AboutPages | null> {
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

  private publishedPagesQueryBuilder(): SelectQueryBuilder<AboutPages> {
    return this.aboutPagesRepository
      .createQueryBuilder('page')
      .where('page.deletedAt IS NULL')
      .andWhere('page.status = :status', { status: 'published' })
      .andWhere('page.publishedAt IS NOT NULL')
      .andWhere('page.publishedAt <= :now', { now: new Date() });
  }

  private async queryTeamMembers(
    page: number,
    limit: number,
    locale?: string,
  ): Promise<PaginatedResult<PublicTeamMemberDto>> {
    const qb = this.teamMembersRepository
      .createQueryBuilder('member')
      .where('member.deletedAt IS NULL')
      .andWhere('member.status = :status', { status: 'published' });

    if (locale) {
      qb.andWhere('member.locale = :locale', { locale });
    }

    qb.orderBy('member.sortOrder', 'ASC')
      .addOrderBy('member.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [members, total] = await qb.getManyAndCount();

    return {
      data: members.map((member) => this.toTeamMemberDto(member)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  private async queryResources(
    page: number,
    limit: number,
    type?: 'financial' | 'media',
    locale?: string,
  ): Promise<PaginatedResult<PublicAboutResourceDto>> {
    const qb = this.aboutResourcesRepository
      .createQueryBuilder('resource')
      .where('resource.deletedAt IS NULL')
      .andWhere('resource.status = :status', { status: 'published' })
      .andWhere('resource.publishedAt IS NOT NULL')
      .andWhere('resource.publishedAt <= :now', { now: new Date() });

    if (type) {
      qb.andWhere('resource.type = :type', { type });
    }

    if (locale) {
      qb.andWhere('resource.locale = :locale', { locale });
    }

    qb.orderBy('resource.sortOrder', 'ASC')
      .addOrderBy('resource.publishedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [resources, total] = await qb.getManyAndCount();

    return {
      data: resources.map((resource) => this.toAboutResourceDto(resource)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  private async queryTimelineMilestones(
    page: number,
    limit: number,
    locale?: string,
  ): Promise<PaginatedResult<PublicAboutTimelineMilestoneDto>> {
    const qb = this.timelineMilestonesRepository
      .createQueryBuilder('milestone')
      .where('milestone.deletedAt IS NULL')
      .andWhere('milestone.status = :status', { status: 'published' });

    if (locale) {
      qb.andWhere('milestone.locale = :locale', { locale });
    }

    qb.orderBy('milestone.periodSortOrder', 'ASC')
      .addOrderBy('milestone.sortOrder', 'ASC')
      .addOrderBy('milestone.year', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [milestones, total] = await qb.getManyAndCount();

    return {
      data: milestones.map((milestone) => this.toTimelineMilestoneDto(milestone)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  private toAboutPageDto(page: AboutPages): PublicAboutPageDto {
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

  private toTeamMemberDto(member: TeamMembers): PublicTeamMemberDto {
    return {
      id: member.id,
      name: member.name,
      role: member.role,
      bio: member.bio,
      photoUrl: member.photoUrl,
      sortOrder: member.sortOrder,
      locale: member.locale,
    };
  }

  private toAboutResourceDto(resource: AboutResources): PublicAboutResourceDto {
    return {
      id: resource.id,
      type: resource.type,
      title: resource.title,
      description: resource.description,
      fileUrl: resource.fileUrl,
      externalUrl: resource.externalUrl,
      publishedAt: resource.publishedAt?.toISOString() ?? null,
      sortOrder: resource.sortOrder,
      locale: resource.locale,
    };
  }

  private toTimelineMilestoneDto(
    milestone: AboutTimelineMilestones,
  ): PublicAboutTimelineMilestoneDto {
    return {
      id: milestone.id,
      periodLabel: milestone.periodLabel,
      periodTitle: milestone.periodTitle,
      periodSortOrder: milestone.periodSortOrder,
      year: milestone.year,
      title: milestone.title,
      excerpt: milestone.excerpt,
      content: milestone.content,
      imageUrl: milestone.imageUrl,
      linkUrl: milestone.linkUrl,
      sortOrder: milestone.sortOrder,
      locale: milestone.locale,
    };
  }

  private async fetchWhyUsContent(locale?: string): Promise<PublicWhyUsContentDto> {
    const sectionQb = this.whyUsSectionsRepository
      .createQueryBuilder('section')
      .where('section.deletedAt IS NULL')
      .andWhere('section.status = :status', { status: 'published' });

    if (locale) {
      sectionQb.andWhere('section.locale = :locale', { locale });
    }

    const section = await sectionQb.getOne();

    const itemsQb = this.whyUsItemsRepository
      .createQueryBuilder('item')
      .where('item.deletedAt IS NULL')
      .andWhere('item.status = :status', { status: 'published' });

    if (locale) {
      itemsQb.andWhere('item.locale = :locale', { locale });
    }

    const items = await itemsQb
      .orderBy('item.sortOrder', 'ASC')
      .addOrderBy('item.title', 'ASC')
      .getMany();

    return {
      section: section ? this.toWhyUsSectionDto(section) : null,
      items: items.map((item) => this.toWhyUsItemDto(item)),
    };
  }

  private toWhyUsSectionDto(section: WhyUsSections): PublicWhyUsSectionDto {
    return {
      id: section.id,
      title: section.title,
      subtitle: section.subtitle,
      locale: section.locale,
    };
  }

  private toWhyUsItemDto(item: WhyUsItems): PublicWhyUsItemDto {
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      linkUrl: item.linkUrl,
      iconKey: item.iconKey,
      sortOrder: item.sortOrder,
      locale: item.locale,
    };
  }

  private async fetchPublishedHeroSlides(locale?: string): Promise<PublicHeroSlideDto[]> {
    const qb = this.heroSlidesRepository
      .createQueryBuilder('slide')
      .where('slide.deletedAt IS NULL')
      .andWhere('slide.status = :status', { status: 'published' });

    if (locale) {
      qb.andWhere('slide.locale = :locale', { locale });
    }

    const slides = await qb
      .orderBy('slide.sortOrder', 'ASC')
      .addOrderBy('slide.title', 'ASC')
      .getMany();

    return slides.map((slide) => this.toHeroSlideDto(slide));
  }

  private toHeroSlideDto(slide: HeroSlides): PublicHeroSlideDto {
    return {
      id: slide.id,
      subtitle: slide.subtitle,
      title: slide.title,
      description: slide.description,
      imageUrl: slide.imageUrl,
      imageAlt: slide.imageAlt,
      href: slide.href,
      sortOrder: slide.sortOrder,
      locale: slide.locale,
    };
  }

  private async fetchHappyCustomersContent(
    locale?: string,
  ): Promise<PublicHappyCustomersContentDto> {
    const sectionQb = this.happyCustomersSectionsRepository
      .createQueryBuilder('section')
      .where('section.deletedAt IS NULL')
      .andWhere('section.status = :status', { status: 'published' });

    if (locale) {
      sectionQb.andWhere('section.locale = :locale', { locale });
    }

    const section = await sectionQb.getOne();

    const statsQb = this.happyCustomersStatsRepository
      .createQueryBuilder('stat')
      .where('stat.deletedAt IS NULL')
      .andWhere('stat.status = :status', { status: 'published' });

    if (locale) {
      statsQb.andWhere('stat.locale = :locale', { locale });
    }

    const stats = await statsQb
      .orderBy('stat.sortOrder', 'ASC')
      .addOrderBy('stat.label', 'ASC')
      .getMany();

    return {
      section: section ? this.toHappyCustomersSectionDto(section) : null,
      stats: stats.map((stat) => this.toHappyCustomersStatDto(stat)),
    };
  }

  private toHappyCustomersSectionDto(
    section: HappyCustomersSections,
  ): PublicHappyCustomersSectionDto {
    return {
      id: section.id,
      title: section.title,
      subtitle: section.subtitle,
      paragraph1: section.paragraph1,
      paragraph2: section.paragraph2,
      imageUrl: section.imageUrl,
      imageAlt: section.imageAlt,
      badgeValue: section.badgeValue,
      badgeLabel: section.badgeLabel,
      locale: section.locale,
    };
  }

  private toHappyCustomersStatDto(stat: HappyCustomersStats): PublicHappyCustomersStatDto {
    return {
      id: stat.id,
      label: stat.label,
      percentValue: stat.percentValue,
      colorKey: stat.colorKey,
      sortOrder: stat.sortOrder,
      locale: stat.locale,
    };
  }
}
