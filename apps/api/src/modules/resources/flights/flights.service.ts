import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { applyCatalogOrganizationScope } from '../../../common/org-scope/catalog-org-filter';
import { OrgScopeService } from '../../../common/org-scope/org-scope.service';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { Flights } from '../../../entities/generated';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { FlightsListQueryDto } from './dto/flights-list-query.dto';

@Injectable()
export class FlightsService extends CrudService<Flights> {
  constructor(
    @InjectRepository(Flights)
    private readonly flightsRepository: Repository<Flights>,
    private readonly orgScopeService: OrgScopeService,
  ) {
    super(flightsRepository);
  }

  async findAllForUser(
    query: FlightsListQueryDto,
    user: AuthUserDto,
  ): Promise<PaginatedResult<Flights>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const organizationId =
      await this.orgScopeService.resolveCatalogListOrganizationId(
        user,
        query.organizationId,
      );

    const qb = this.flightsRepository
      .createQueryBuilder('flight')
      .where('flight.deletedAt IS NULL');

    applyCatalogOrganizationScope(qb, 'flight', organizationId);

    const search = query.search?.trim();
    if (search) {
      qb.andWhere('flight.flightNumber LIKE :term', { term: `%${search}%` });
    }

    qb.orderBy('flight.createdAt', 'DESC')
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
