import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import {
  Employees,
  Organizations,
  OrganizationSettings,
  TourGuides,
  Users,
} from '../../../entities/generated';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import type { OrganizationListItemDto } from './dto/organization-list-item.dto';
import type { OrganizationsListQueryDto } from './dto/organizations-list-query.dto';

function optionalLogoUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed || null;
}

@Injectable()
export class OrganizationsService extends CrudService<Organizations> {
  constructor(
    @InjectRepository(Organizations)
    private readonly organizationsRepository: Repository<Organizations>,
    @InjectRepository(OrganizationSettings)
    private readonly settingsRepository: Repository<OrganizationSettings>,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    @InjectRepository(Employees)
    private readonly employeesRepository: Repository<Employees>,
    @InjectRepository(TourGuides)
    private readonly tourGuidesRepository: Repository<TourGuides>,
  ) {
    super(organizationsRepository);
  }

  async findAllWithCounts(
    query: OrganizationsListQueryDto,
  ): Promise<PaginatedResult<OrganizationListItemDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const search = query.search?.trim();

    const qb = this.organizationsRepository
      .createQueryBuilder('org')
      .where('org.deletedAt IS NULL')
      .orderBy('org.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      qb.andWhere('(org.name LIKE :term OR org.slug LIKE :term)', {
        term: `%${search}%`,
      });
    }

    const [rows, total] = await qb.getManyAndCount();
    const ids = rows.map((row) => row.id);
    const [counts, brandingLogos] = await Promise.all([
      this.loadCountsByOrganizationId(ids),
      this.loadBrandingLogoUrlsByOrganizationId(ids),
    ]);

    return {
      data: rows.map((org) => {
        const c = counts.get(org.id) ?? {
          userCount: 0,
          employeeCount: 0,
          productCount: 0,
        };
        return {
          id: org.id,
          name: org.name,
          slug: org.slug,
          logoUrl:
            brandingLogos.get(org.id) ?? optionalLogoUrl(org.logoUrl) ?? null,
          legalForm: org.legalForm ?? null,
          currency: org.currency,
          status: org.status,
          createdAt:
            org.createdAt instanceof Date
              ? org.createdAt.toISOString()
              : String(org.createdAt),
          userCount: c.userCount,
          employeeCount: c.employeeCount,
          productCount: c.productCount,
        };
      }),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  private async loadBrandingLogoUrlsByOrganizationId(
    organizationIds: string[],
  ): Promise<Map<string, string>> {
    const map = new Map<string, string>();
    if (organizationIds.length === 0) return map;

    const settings = await this.settingsRepository.find({
      where: {
        organizationId: In(organizationIds),
        settingGroup: 'branding',
        settingKey: 'platform',
        deletedAt: IsNull(),
      },
    });

    for (const setting of settings) {
      const value =
        setting.settingValue && typeof setting.settingValue === 'object'
          ? (setting.settingValue as Record<string, unknown>)
          : null;
      const logoUrl = optionalLogoUrl(value?.logoUrl);
      if (logoUrl) {
        map.set(setting.organizationId, logoUrl);
      }
    }

    return map;
  }

  private async loadCountsByOrganizationId(
    organizationIds: string[],
  ): Promise<
    Map<
      string,
      { userCount: number; employeeCount: number; productCount: number }
    >
  > {
    const map = new Map<
      string,
      { userCount: number; employeeCount: number; productCount: number }
    >();
    for (const id of organizationIds) {
      map.set(id, { userCount: 0, employeeCount: 0, productCount: 0 });
    }
    if (organizationIds.length === 0) return map;

    const [userRows, employeeRows, guideRows] = await Promise.all([
      this.usersRepository
        .createQueryBuilder('u')
        .select('u.organizationId', 'organizationId')
        .addSelect('COUNT(*)', 'count')
        .where('u.organizationId IN (:...ids)', { ids: organizationIds })
        .andWhere('u.deletedAt IS NULL')
        .groupBy('u.organizationId')
        .getRawMany<{ organizationId: string; count: string }>(),
      this.employeesRepository
        .createQueryBuilder('e')
        .select('e.organizationId', 'organizationId')
        .addSelect('COUNT(*)', 'count')
        .where('e.organizationId IN (:...ids)', { ids: organizationIds })
        .andWhere('e.deletedAt IS NULL')
        .groupBy('e.organizationId')
        .getRawMany<{ organizationId: string; count: string }>(),
      this.tourGuidesRepository
        .createQueryBuilder('g')
        .select('g.organizationId', 'organizationId')
        .addSelect('COUNT(*)', 'count')
        .where('g.organizationId IN (:...ids)', { ids: organizationIds })
        .andWhere('g.deletedAt IS NULL')
        .groupBy('g.organizationId')
        .getRawMany<{ organizationId: string; count: string }>(),
    ]);

    for (const row of userRows) {
      const entry = map.get(row.organizationId);
      if (entry) entry.userCount = Number(row.count) || 0;
    }
    for (const row of employeeRows) {
      const entry = map.get(row.organizationId);
      if (entry) entry.employeeCount = Number(row.count) || 0;
    }
    for (const row of guideRows) {
      const entry = map.get(row.organizationId);
      if (entry) entry.productCount = Number(row.count) || 0;
    }

    return map;
  }
}
