import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { applyCatalogOrganizationScope } from '../../../common/org-scope/catalog-org-filter';
import { OrgScopeService } from '../../../common/org-scope/org-scope.service';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { Activities } from '../../../entities/generated';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { ActivitiesListQueryDto } from './dto/activities-list-query.dto';

@Injectable()
export class ActivitiesService extends CrudService<Activities> {
  constructor(
    @InjectRepository(Activities)
    private readonly activitiesRepository: Repository<Activities>,
    private readonly orgScopeService: OrgScopeService,
  ) {
    super(activitiesRepository);
  }

  async findAllForUser(
    query: ActivitiesListQueryDto,
    user: AuthUserDto,
  ): Promise<PaginatedResult<Activities>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const organizationId =
      await this.orgScopeService.resolveCatalogListOrganizationId(
        user,
        query.organizationId,
      );

    const qb = this.activitiesRepository
      .createQueryBuilder('activity')
      .where('activity.deletedAt IS NULL');

    applyCatalogOrganizationScope(qb, 'activity', organizationId);

    if (query.providerId) {
      qb.andWhere('activity.providerId = :providerId', {
        providerId: query.providerId,
      });
    }

    const search = query.search?.trim();
    if (search) {
      qb.andWhere('activity.title LIKE :term', { term: `%${search}%` });
    }

    qb.orderBy('activity.createdAt', 'DESC')
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
