import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { HeroSlides } from '../../../entities/hero-slide.entity';
import { CreateHeroSlideDto } from './dto/create-hero-slide.dto';
import { UpdateHeroSlideDto } from './dto/update-hero-slide.dto';
import { HeroSlidesListQueryDto } from './dto/hero-slides-list-query.dto';

@Injectable()
export class HeroSlidesService extends CrudService<HeroSlides> {
  constructor(
    @InjectRepository(HeroSlides)
    private readonly slidesRepository: Repository<HeroSlides>,
  ) {
    super(slidesRepository);
  }

  createFromDto(dto: CreateHeroSlideDto, actorUserId?: string): Promise<HeroSlides> {
    return super.create(dto as DeepPartial<HeroSlides>, actorUserId);
  }

  updateFromDto(
    id: string,
    dto: UpdateHeroSlideDto,
    actorUserId?: string,
  ): Promise<HeroSlides> {
    return super.update(id, dto as DeepPartial<HeroSlides>, actorUserId);
  }

  override async findAll(query: HeroSlidesListQueryDto): Promise<PaginatedResult<HeroSlides>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.slidesRepository
      .createQueryBuilder('slide')
      .where('slide.deletedAt IS NULL');

    const search = query.search?.trim();
    if (search) {
      qb.andWhere(
        '(slide.title LIKE :term OR slide.subtitle LIKE :term OR slide.description LIKE :term)',
        { term: `%${search}%` },
      );
    }

    if (query.locale) {
      qb.andWhere('slide.locale = :locale', { locale: query.locale });
    }

    if (query.status) {
      qb.andWhere('slide.status = :status', { status: query.status });
    }

    qb.orderBy('slide.sortOrder', 'ASC')
      .addOrderBy('slide.title', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

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
}
