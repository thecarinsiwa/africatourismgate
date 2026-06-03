import { ensureHttpsAssetUrl } from '../../../common/utils/public-asset-url';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { OrgScopeService } from '../../../common/org-scope/org-scope.service';
import { newId } from '../../../common/utils/uuid';
import { OrganizationSettings, Organizations } from '../../../entities/generated';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { BulkUpsertOrganizationSettingsDto } from './dto/bulk-upsert-organization-settings.dto';
import {
  OrganizationSettingDto,
  toOrganizationSettingDto,
} from './dto/organization-setting.dto';
import { OrganizationSettingsListQueryDto } from './dto/organization-settings-list-query.dto';
import { validateSettingValue } from './validate-setting-value';

type PublicOrganizationBranding = {
  organizationId: string | null;
  organizationSlug: string | null;
  organizationName: string;
  displayName: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string | null;
  faviconUrl: string | null;
};

const DEFAULT_PUBLIC_BRANDING: PublicOrganizationBranding = {
  organizationId: null,
  organizationSlug: null,
  organizationName: 'Africa Tourism Gate',
  displayName: 'Africa Tourism Gate',
  primaryColor: '#0B6E4F',
  secondaryColor: '#199a45',
  logoUrl: null,
  faviconUrl: null,
};

@Injectable()
export class OrganizationSettingsService {
  constructor(
    @InjectRepository(OrganizationSettings)
    private readonly settingsRepository: Repository<OrganizationSettings>,
    @InjectRepository(Organizations)
    private readonly organizationsRepository: Repository<Organizations>,
    private readonly orgScope: OrgScopeService,
  ) {}

  async findPublicBranding(
    organizationSlug?: string,
  ): Promise<PublicOrganizationBranding> {
    const qb = this.organizationsRepository
      .createQueryBuilder('org')
      .where('org.deletedAt IS NULL')
      .andWhere('org.status = :status', { status: 'active' });

    if (organizationSlug?.trim()) {
      qb.andWhere('LOWER(org.slug) = :slug', {
        slug: organizationSlug.trim().toLowerCase(),
      });
    } else {
      qb.orderBy('org.createdAt', 'ASC');
    }

    const organization = await qb.getOne();
    if (!organization) {
      return DEFAULT_PUBLIC_BRANDING;
    }

    const brandingSetting = await this.settingsRepository.findOne({
      where: {
        organizationId: organization.id,
        settingKey: 'platform',
        deletedAt: IsNull(),
      },
    });

    const branding = brandingSetting?.settingValue ?? {};
    const displayName =
      typeof branding.displayName === 'string' && branding.displayName.trim()
        ? branding.displayName.trim()
        : organization.name;
    const primaryColor =
      typeof branding.primaryColor === 'string' && branding.primaryColor.trim()
        ? branding.primaryColor.trim()
        : DEFAULT_PUBLIC_BRANDING.primaryColor;
    const secondaryColor =
      typeof branding.secondaryColor === 'string' &&
      branding.secondaryColor.trim()
        ? branding.secondaryColor.trim()
        : DEFAULT_PUBLIC_BRANDING.secondaryColor;
    const logoUrl = ensureHttpsAssetUrl(
      typeof branding.logoUrl === 'string' && branding.logoUrl.trim()
        ? branding.logoUrl.trim()
        : DEFAULT_PUBLIC_BRANDING.logoUrl,
    );
    const faviconUrl = ensureHttpsAssetUrl(
      typeof branding.faviconUrl === 'string' && branding.faviconUrl.trim()
        ? branding.faviconUrl.trim()
        : DEFAULT_PUBLIC_BRANDING.faviconUrl,
    );

    return {
      organizationId: organization.id,
      organizationSlug: organization.slug,
      organizationName: organization.name,
      displayName,
      primaryColor,
      secondaryColor,
      logoUrl,
      faviconUrl,
    };
  }

  async findAll(
    user: AuthUserDto,
    query: OrganizationSettingsListQueryDto,
  ): Promise<PaginatedResult<OrganizationSettingDto>> {
    const organizationId = await this.orgScope.resolveOrganizationId(
      user,
      query.organizationId,
    );
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.settingsRepository
      .createQueryBuilder('s')
      .where('s.deletedAt IS NULL')
      .andWhere('s.organizationId = :organizationId', { organizationId })
      .orderBy('s.settingGroup', 'ASC')
      .addOrderBy('s.settingKey', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [rows, total] = await qb.getManyAndCount();

    return {
      data: rows.map(toOrganizationSettingDto),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(
    user: AuthUserDto,
    id: string,
    queryOrganizationId?: string,
  ): Promise<OrganizationSettingDto> {
    const organizationId = await this.orgScope.resolveOrganizationId(
      user,
      queryOrganizationId,
    );
    const row = await this.settingsRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!row) {
      throw new NotFoundException('Paramètre introuvable.');
    }
    this.orgScope.assertRowBelongsToOrg(row.organizationId, organizationId);
    return toOrganizationSettingDto(row);
  }

  async bulkUpsert(
    user: AuthUserDto,
    dto: BulkUpsertOrganizationSettingsDto,
  ): Promise<OrganizationSettingDto[]> {
    await this.orgScope.rejectOrganizationIdInBodyForNonSuperAdmin(
      user,
      dto.organizationId,
    );

    const organizationId = await this.orgScope.resolveOrganizationId(
      user,
      dto.organizationId,
    );

    const results: OrganizationSettingDto[] = [];

    for (const item of dto.settings) {
      const settingValue = validateSettingValue(
        item.settingKey,
        item.settingValue,
      );

      let row = await this.settingsRepository.findOne({
        where: {
          organizationId,
          settingKey: item.settingKey,
          deletedAt: IsNull(),
        },
      });

      if (row) {
        row.settingGroup = item.settingGroup;
        row.settingValue = settingValue;
        row.updatedByUserId = user.id;
        row = await this.settingsRepository.save(row);
      } else {
        row = this.settingsRepository.create({
          id: newId(),
          organizationId,
          settingGroup: item.settingGroup,
          settingKey: item.settingKey,
          settingValue,
          createdByUserId: user.id,
        });
        row = await this.settingsRepository.save(row);
      }

      results.push(toOrganizationSettingDto(row));
    }

    return results;
  }
}
