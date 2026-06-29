import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { Employees, Organizations, Users } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { OrganizationListItemDto } from './dto/organization-list-item.dto';
import { OrganizationsListQueryDto } from './dto/organizations-list-query.dto';

type CountRow = {
  organizationId: string;
  count: string;
};

@Injectable()
export class OrganizationsService extends CrudService<Organizations> {
  constructor(
    @InjectRepository(Organizations)
    private readonly organizationsRepository: Repository<Organizations>,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    @InjectRepository(Employees)
    private readonly employeesRepository: Repository<Employees>,
  ) {
    super(organizationsRepository);
  }

  async list(
    query: OrganizationsListQueryDto,
  ): Promise<PaginatedResult<OrganizationListItemDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.organizationsRepository
      .createQueryBuilder('org')
      .where('org.deletedAt IS NULL');

    const search = query.search?.trim();
    if (search) {
      qb.andWhere('(org.name LIKE :search OR org.slug LIKE :search)', {
        search: `%${search}%`,
      });
    }

    const total = await qb.getCount();

    const organizations = await qb
      .orderBy('org.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const orgIds = organizations.map((org) => org.id);
    const userCountByOrgId = await this.loadUserCountByOrganizationId(orgIds);
    const employeeCountByOrgId = await this.loadEmployeeCountByOrganizationId(orgIds);

    const data = organizations.map((org) => ({
      id: org.id,
      name: org.name,
      slug: org.slug,
      logoUrl: org.logoUrl,
      legalForm: org.legalForm,
      currency: org.currency,
      status: org.status,
      createdAt: org.createdAt.toISOString(),
      userCount: userCountByOrgId.get(org.id) ?? 0,
      employeeCount: employeeCountByOrgId.get(org.id) ?? 0,
    }));

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

  private async loadUserCountByOrganizationId(
    organizationIds: string[],
  ): Promise<Map<string, number>> {
    if (organizationIds.length === 0) {
      return new Map();
    }

    const rows = await this.usersRepository
      .createQueryBuilder('user')
      .select('user.organizationId', 'organizationId')
      .addSelect('COUNT(user.id)', 'count')
      .where('user.organizationId IN (:...organizationIds)', { organizationIds })
      .andWhere('user.deletedAt IS NULL')
      .groupBy('user.organizationId')
      .getRawMany<CountRow>();

    return new Map(rows.map((row) => [row.organizationId, Number(row.count)]));
  }

  private async loadEmployeeCountByOrganizationId(
    organizationIds: string[],
  ): Promise<Map<string, number>> {
    if (organizationIds.length === 0) {
      return new Map();
    }

    const rows = await this.employeesRepository
      .createQueryBuilder('employee')
      .select('employee.organizationId', 'organizationId')
      .addSelect('COUNT(employee.id)', 'count')
      .where('employee.organizationId IN (:...organizationIds)', { organizationIds })
      .andWhere('employee.deletedAt IS NULL')
      .groupBy('employee.organizationId')
      .getRawMany<CountRow>();

    return new Map(rows.map((row) => [row.organizationId, Number(row.count)]));
  }
}
