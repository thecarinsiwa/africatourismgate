import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { applyCatalogOrganizationScope } from '../../../common/org-scope/catalog-org-filter';
import { OrgScopeService } from '../../../common/org-scope/org-scope.service';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { Cabins } from '../../../entities/generated';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { CabinsListQueryDto } from './dto/cabins-list-query.dto';

@Injectable()
export class CabinsService extends CrudService<Cabins> {
  constructor(
    @InjectRepository(Cabins)
    private readonly cabinsRepository: Repository<Cabins>,
    private readonly orgScopeService: OrgScopeService,
  ) {
    super(cabinsRepository);
  }

  async findAllForUser(
    query: CabinsListQueryDto,
    user: AuthUserDto,
  ): Promise<PaginatedResult<Cabins>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const organizationId =
      await this.orgScopeService.resolveCatalogListOrganizationId(
        user,
        query.organizationId,
      );

    const qb = this.cabinsRepository
      .createQueryBuilder('cabin')
      .where('cabin.deletedAt IS NULL');

    applyCatalogOrganizationScope(qb, 'cabin', organizationId);

    if (query.shipId) {
      qb.andWhere('cabin.shipId = :shipId', { shipId: query.shipId });
    }

    qb.orderBy('cabin.createdAt', 'DESC')
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
