import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { applyCatalogOrganizationScope } from '../../../common/org-scope/catalog-org-filter';
import { OrgScopeService } from '../../../common/org-scope/org-scope.service';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { Vehicles } from '../../../entities/generated';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { VehiclesListQueryDto } from './dto/vehicles-list-query.dto';

@Injectable()
export class VehiclesService extends CrudService<Vehicles> {
  constructor(
    @InjectRepository(Vehicles)
    private readonly vehiclesRepository: Repository<Vehicles>,
    private readonly orgScopeService: OrgScopeService,
  ) {
    super(vehiclesRepository);
  }

  async findAllForUser(
    query: VehiclesListQueryDto,
    user: AuthUserDto,
  ): Promise<PaginatedResult<Vehicles>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const organizationId =
      await this.orgScopeService.resolveCatalogListOrganizationId(
        user,
        query.organizationId,
      );

    const qb = this.vehiclesRepository
      .createQueryBuilder('vehicle')
      .where('vehicle.deletedAt IS NULL');

    applyCatalogOrganizationScope(qb, 'vehicle', organizationId);

    if (query.agencyId) {
      qb.andWhere('vehicle.agencyId = :agencyId', { agencyId: query.agencyId });
    }
    if (query.categoryId) {
      qb.andWhere('vehicle.categoryId = :categoryId', {
        categoryId: query.categoryId,
      });
    }

    const search = query.search?.trim();
    if (search) {
      qb.andWhere('vehicle.licensePlate LIKE :term', { term: `%${search}%` });
    }

    qb.orderBy('vehicle.createdAt', 'DESC')
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
