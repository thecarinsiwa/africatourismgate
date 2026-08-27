import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { applyCatalogOrganizationScope } from '../../../common/org-scope/catalog-org-filter';
import { OrgScopeService } from '../../../common/org-scope/org-scope.service';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { Properties } from '../../../entities/generated';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { PropertiesListQueryDto } from './dto/properties-list-query.dto';

@Injectable()
export class PropertiesService extends CrudService<Properties> {
  constructor(
    @InjectRepository(Properties)
    private readonly propertiesRepository: Repository<Properties>,
    private readonly orgScopeService: OrgScopeService,
  ) {
    super(propertiesRepository);
  }

  async findAllForUser(
    query: PropertiesListQueryDto,
    user: AuthUserDto,
  ): Promise<PaginatedResult<Properties>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const organizationId =
      await this.orgScopeService.resolveCatalogListOrganizationId(
        user,
        query.organizationId,
      );

    const qb = this.propertiesRepository
      .createQueryBuilder('property')
      .where('property.deletedAt IS NULL');

    applyCatalogOrganizationScope(qb, 'property', organizationId);

    if (query.destinationId) {
      qb.andWhere('property.destinationId = :destinationId', {
        destinationId: query.destinationId,
      });
    }

    const search = query.search?.trim();
    if (search) {
      qb.andWhere(
        '(property.name LIKE :term OR property.slug LIKE :term)',
        { term: `%${search}%` },
      );
    }

    qb.orderBy('property.createdAt', 'DESC')
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
