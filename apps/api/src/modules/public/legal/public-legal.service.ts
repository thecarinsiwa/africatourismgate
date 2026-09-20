import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import {
  LegalPages,
  type LegalPageSectionKey,
} from '../../../entities/legal-page.entity';
import { PublicLegalPagesListQueryDto } from './dto/public-legal-pages-list-query.dto';

export type PublicLegalPageDto = {
  id: string;
  sectionKey: LegalPageSectionKey;
  title: string;
  content: string;
  publishedAt: string | null;
  locale: string;
};

const FALLBACK_LOCALE = 'fr';

@Injectable()
export class PublicLegalService {
  constructor(
    @InjectRepository(LegalPages)
    private readonly legalPagesRepository: Repository<LegalPages>,
  ) {}

  async listPages(query: PublicLegalPagesListQueryDto): Promise<PublicLegalPageDto[]> {
    const localized = await this.fetchPublishedPages(query.sectionKey, query.locale);
    if (localized.length > 0 || !query.locale) {
      return localized;
    }
    return this.fetchPublishedPages(query.sectionKey, FALLBACK_LOCALE);
  }

  async getPageBySectionKey(
    sectionKey: LegalPageSectionKey,
    locale?: string,
  ): Promise<PublicLegalPageDto> {
    if (locale) {
      const localized = await this.findPublishedPage(sectionKey, locale);
      if (localized) {
        return this.toDto(localized);
      }
    }

    const fallbackLocale = locale && locale !== FALLBACK_LOCALE ? FALLBACK_LOCALE : undefined;
    const fallback = await this.findPublishedPage(sectionKey, fallbackLocale);
    if (!fallback) {
      throw new NotFoundException(`Legal page "${sectionKey}" not found`);
    }

    return this.toDto(fallback);
  }

  private async fetchPublishedPages(
    sectionKey?: LegalPageSectionKey,
    locale?: string,
  ): Promise<PublicLegalPageDto[]> {
    const qb = this.publishedQueryBuilder();
    if (sectionKey) {
      qb.andWhere('page.sectionKey = :sectionKey', { sectionKey });
    }
    if (locale) {
      qb.andWhere('page.locale = :locale', { locale });
    }
    qb.orderBy('page.sectionKey', 'ASC').addOrderBy('page.publishedAt', 'DESC');

    const pages = await qb.getMany();
    return pages.map((page) => this.toDto(page));
  }

  private async findPublishedPage(
    sectionKey: LegalPageSectionKey,
    locale?: string,
  ): Promise<LegalPages | null> {
    const qb = this.publishedQueryBuilder().andWhere('page.sectionKey = :sectionKey', {
      sectionKey,
    });

    if (locale) {
      qb.andWhere('page.locale = :locale', { locale });
    } else {
      qb.orderBy('page.publishedAt', 'DESC');
    }

    return qb.getOne();
  }

  private publishedQueryBuilder(): SelectQueryBuilder<LegalPages> {
    return this.legalPagesRepository
      .createQueryBuilder('page')
      .where('page.deletedAt IS NULL')
      .andWhere('page.status = :status', { status: 'published' })
      .andWhere('page.publishedAt IS NOT NULL')
      .andWhere('page.publishedAt <= :now', { now: new Date() });
  }

  private toDto(page: LegalPages): PublicLegalPageDto {
    return {
      id: page.id,
      sectionKey: page.sectionKey,
      title: page.title,
      content: page.content,
      publishedAt: page.publishedAt?.toISOString() ?? null,
      locale: page.locale,
    };
  }
}
