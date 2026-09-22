import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DEFAULT_SITE_MAINTENANCE,
  DEFAULT_SITE_MAINTENANCE_LOCALE,
  normalizeSiteMaintenanceLocale,
  toPublicSiteMaintenanceFromRow,
  type PublicSiteMaintenance,
} from '@africatourismgate/types';
import { IsNull, LessThanOrEqual, MoreThan, type FindOptionsWhere, Repository } from 'typeorm';
import {
  OrgScopeService,
  PLATFORM_ORG_ID,
} from '../../../common/org-scope/org-scope.service';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { newId } from '../../../common/utils/uuid';
import { CrudService } from '../../../common/crud/crud.service';
import { Organizations } from '../../../entities/generated';
import { OrganizationMaintenances } from '../../../entities/organization-maintenance.entity';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { CreateOrganizationMaintenanceDto } from './dto/create-organization-maintenance.dto';
import {
  OrganizationMaintenanceDto,
  toOrganizationMaintenanceDto,
} from './dto/organization-maintenance.dto';
import { OrganizationMaintenancesListQueryDto } from './dto/organization-maintenances-list-query.dto';
import { UpdateOrganizationMaintenanceDto } from './dto/update-organization-maintenance.dto';

@Injectable()
export class OrganizationMaintenancesService extends CrudService<OrganizationMaintenances> {
  constructor(
    @InjectRepository(OrganizationMaintenances)
    private readonly maintenancesRepository: Repository<OrganizationMaintenances>,
    @InjectRepository(Organizations)
    private readonly organizationsRepository: Repository<Organizations>,
    private readonly orgScopeService: OrgScopeService,
  ) {
    super(maintenancesRepository);
  }

  /** Fenêtre active courante pour le site public (fail-open → inactif). */
  async findPublicCurrent(
    organizationSlug?: string,
    locale?: string,
  ): Promise<PublicSiteMaintenance> {
    try {
      const organization = await this.resolvePublicOrganization(organizationSlug);
      return this.getResolvedCurrent(organization.id, locale);
    } catch {
      return { ...DEFAULT_SITE_MAINTENANCE };
    }
  }

  async getResolvedCurrent(
    organizationId: string = PLATFORM_ORG_ID,
    locale?: string,
  ): Promise<PublicSiteMaintenance> {
    const requested = normalizeSiteMaintenanceLocale(locale);
    const candidates = [
      requested,
      ...(requested !== DEFAULT_SITE_MAINTENANCE_LOCALE
        ? [DEFAULT_SITE_MAINTENANCE_LOCALE]
        : []),
    ];

    for (const candidate of candidates) {
      const row = await this.findActiveRow(organizationId, candidate);
      if (row) {
        return toPublicSiteMaintenanceFromRow(row);
      }
    }

    // Dernier recours : toute fenêtre active (gate global, contenu d’une autre langue).
    const anyRow = await this.findActiveRow(organizationId);
    if (!anyRow) {
      return { ...DEFAULT_SITE_MAINTENANCE };
    }
    return toPublicSiteMaintenanceFromRow(anyRow);
  }

  private async findActiveRow(
    organizationId: string,
    locale?: string,
  ): Promise<OrganizationMaintenances | null> {
    const now = new Date();
    const base: FindOptionsWhere<OrganizationMaintenances> = {
      organizationId,
      enabled: true,
      deletedAt: IsNull(),
      startsAt: LessThanOrEqual(now),
      ...(locale ? { locale } : {}),
    };

    return this.maintenancesRepository.findOne({
      where: [
        { ...base, endsAt: IsNull() },
        { ...base, endsAt: MoreThan(now) },
      ],
      order: { startsAt: 'DESC' },
    });
  }

  async list(
    query: OrganizationMaintenancesListQueryDto,
    user: AuthUserDto,
  ): Promise<PaginatedResult<OrganizationMaintenanceDto>> {
    const organizationId = await this.orgScopeService.resolveOrganizationId(
      user,
      query.organizationId,
    );

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const locale = query.locale
      ? normalizeSiteMaintenanceLocale(query.locale)
      : undefined;

    const [rows, total] = await this.maintenancesRepository.findAndCount({
      where: {
        organizationId,
        deletedAt: IsNull(),
        ...(locale ? { locale } : {}),
      },
      skip: (page - 1) * limit,
      take: limit,
      order: { startsAt: 'DESC' },
    });

    return {
      data: rows.map(toOrganizationMaintenanceDto),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOneDto(
    id: string,
    user: AuthUserDto,
    queryOrganizationId?: string,
  ): Promise<OrganizationMaintenanceDto> {
    const organizationId = await this.orgScopeService.resolveOrganizationId(
      user,
      queryOrganizationId,
    );
    const row = await this.requireRow(id);
    this.orgScopeService.assertRowBelongsToOrg(row.organizationId, organizationId);
    return toOrganizationMaintenanceDto(row);
  }

  async createFromDto(
    dto: CreateOrganizationMaintenanceDto,
    user: AuthUserDto,
  ): Promise<OrganizationMaintenanceDto> {
    await this.orgScopeService.rejectOrganizationIdInBodyForNonSuperAdmin(
      user,
      dto.organizationId,
    );

    const organizationId = await this.orgScopeService.resolveOrganizationId(
      user,
      dto.organizationId,
    );

    const startsAt = this.parseRequiredDate(dto.startsAt, 'startsAt');
    const endsAt = this.parseOptionalDate(dto.endsAt, 'endsAt');
    this.assertWindowValid(startsAt, endsAt);

    const row = await this.create(
      {
        id: newId(),
        organizationId,
        locale: normalizeSiteMaintenanceLocale(dto.locale),
        title: this.normalizeOptionalText(dto.title),
        message: this.normalizeOptionalText(dto.message),
        enabled: dto.enabled === true,
        startsAt,
        endsAt,
      },
      user.id,
    );

    return toOrganizationMaintenanceDto(row);
  }

  async updateFromDto(
    id: string,
    dto: UpdateOrganizationMaintenanceDto,
    user: AuthUserDto,
    queryOrganizationId?: string,
  ): Promise<OrganizationMaintenanceDto> {
    const organizationId = await this.orgScopeService.resolveOrganizationId(
      user,
      queryOrganizationId,
    );
    const row = await this.requireRow(id);
    this.orgScopeService.assertRowBelongsToOrg(row.organizationId, organizationId);

    const startsAt =
      dto.startsAt !== undefined
        ? this.parseRequiredDate(dto.startsAt, 'startsAt')
        : row.startsAt;
    const endsAt =
      dto.endsAt !== undefined
        ? this.parseOptionalDate(dto.endsAt, 'endsAt')
        : row.endsAt;
    this.assertWindowValid(startsAt, endsAt);

    const updated = await this.update(
      id,
      {
        ...(dto.locale !== undefined
          ? { locale: normalizeSiteMaintenanceLocale(dto.locale) }
          : {}),
        ...(dto.title !== undefined
          ? { title: this.normalizeOptionalText(dto.title) }
          : {}),
        ...(dto.message !== undefined
          ? { message: this.normalizeOptionalText(dto.message) }
          : {}),
        ...(dto.enabled !== undefined ? { enabled: dto.enabled === true } : {}),
        ...(dto.startsAt !== undefined ? { startsAt } : {}),
        ...(dto.endsAt !== undefined ? { endsAt } : {}),
      },
      user.id,
    );

    return toOrganizationMaintenanceDto(updated);
  }

  async removeScoped(
    id: string,
    user: AuthUserDto,
    queryOrganizationId?: string,
  ): Promise<void> {
    const organizationId = await this.orgScopeService.resolveOrganizationId(
      user,
      queryOrganizationId,
    );
    const row = await this.requireRow(id);
    this.orgScopeService.assertRowBelongsToOrg(row.organizationId, organizationId);
    await this.remove(id, user.id);
  }

  private assertWindowValid(startsAt: Date, endsAt: Date | null): void {
    if (endsAt != null && endsAt.getTime() <= startsAt.getTime()) {
      throw new BadRequestException(
        'endsAt doit être postérieur à startsAt.',
      );
    }
  }

  private parseRequiredDate(value: string, field: string): Date {
    const parsed = Date.parse(value);
    if (Number.isNaN(parsed)) {
      throw new BadRequestException(`${field} doit être une date ISO 8601 valide.`);
    }
    return new Date(parsed);
  }

  private parseOptionalDate(
    value: string | null | undefined,
    field: string,
  ): Date | null {
    if (value == null || value === '') {
      return null;
    }
    return this.parseRequiredDate(value, field);
  }

  private normalizeOptionalText(value: string | null | undefined): string | null {
    if (value == null) return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private async resolvePublicOrganization(
    organizationSlug?: string,
  ): Promise<Organizations> {
    const slug = organizationSlug?.trim();
    if (slug) {
      const organization = await this.organizationsRepository.findOne({
        where: { slug, deletedAt: IsNull(), status: 'active' },
      });
      if (!organization) {
        throw new NotFoundException('Organisation introuvable.');
      }
      return organization;
    }

    const platform = await this.organizationsRepository.findOne({
      where: { id: PLATFORM_ORG_ID, deletedAt: IsNull() },
    });
    if (!platform) {
      throw new NotFoundException('Organisation plateforme introuvable.');
    }
    return platform;
  }

  private async requireRow(id: string): Promise<OrganizationMaintenances> {
    const row = await this.maintenancesRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!row) {
      throw new NotFoundException(`Maintenance ${id} introuvable.`);
    }
    return row;
  }
}
