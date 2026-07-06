import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { AboutTimelineMilestones } from '../../../entities/about-timeline-milestone.entity';
import { AboutTimelineMilestonesListQueryDto } from './dto/about-timeline-milestones-list-query.dto';
import { CreateAboutTimelineMilestoneDto } from './dto/create-about-timeline-milestone.dto';
import { UpdateAboutTimelineMilestoneDto } from './dto/update-about-timeline-milestone.dto';

@Injectable()
export class AboutTimelineMilestonesService extends CrudService<AboutTimelineMilestones> {
  constructor(
    @InjectRepository(AboutTimelineMilestones)
    private readonly milestonesRepository: Repository<AboutTimelineMilestones>,
  ) {
    super(milestonesRepository);
  }

  createFromDto(
    dto: CreateAboutTimelineMilestoneDto,
    actorUserId?: string,
  ): Promise<AboutTimelineMilestones> {
    return super.create(dto as DeepPartial<AboutTimelineMilestones>, actorUserId);
  }

  updateFromDto(
    id: string,
    dto: UpdateAboutTimelineMilestoneDto,
    actorUserId?: string,
  ): Promise<AboutTimelineMilestones> {
    return super.update(id, dto as DeepPartial<AboutTimelineMilestones>, actorUserId);
  }

  override async findAll(
    query: AboutTimelineMilestonesListQueryDto,
  ): Promise<PaginatedResult<AboutTimelineMilestones>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.milestonesRepository
      .createQueryBuilder('milestone')
      .where('milestone.deletedAt IS NULL');

    const search = query.search?.trim();
    if (search) {
      qb.andWhere(
        '(milestone.title LIKE :term OR milestone.periodTitle LIKE :term OR milestone.periodLabel LIKE :term OR milestone.excerpt LIKE :term)',
        { term: `%${search}%` },
      );
    }

    if (query.status) {
      qb.andWhere('milestone.status = :status', { status: query.status });
    }

    if (query.locale) {
      qb.andWhere('milestone.locale = :locale', { locale: query.locale });
    }

    qb.orderBy('milestone.periodSortOrder', 'ASC')
      .addOrderBy('milestone.sortOrder', 'ASC')
      .addOrderBy('milestone.year', 'ASC')
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
