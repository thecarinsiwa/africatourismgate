import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { OrgScopeService, PLATFORM_ORG_ID } from '../../../common/org-scope/org-scope.service';
import { CrudService } from '../../../common/crud/crud.service';
import { newId } from '../../../common/utils/uuid';
import {
  OrganizationSettings,
  Organizations,
} from '../../../entities/generated';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { BulkUpsertOrganizationSettingsDto } from './dto/bulk-upsert-organization-settings.dto';
import {
  OrganizationSettingDto,
  toOrganizationSettingDto,
} from './dto/organization-setting.dto';
import { PublicBrandingDto } from './dto/public-branding.dto';
import { validateSettingValue } from './validate-setting-value';

const DEFAULT_PUBLIC_BRANDING: PublicBrandingDto = {
  displayName: 'Africa Tourism Gate',
  primaryColor: '#0B6E4F',
  secondaryColor: '#199a45',
  logoUrl: null,
  faviconUrl: null,
};

function normalizeHex(hex: unknown, fallback: string): string {
  if (typeof hex !== 'string') return fallback;
  const trimmed = hex.trim();
  const match = /^#?([0-9a-fA-F]{6})$/.exec(trimmed);
  if (!match) return fallback;
  return `#${match[1].toUpperCase()}`;
}

function optionalAssetUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed || null;
}

@Injectable()
export class OrganizationSettingsService extends CrudService<OrganizationSettings> {
  constructor(
    @InjectRepository(OrganizationSettings)
    private readonly settingsRepository: Repository<OrganizationSettings>,
    @InjectRepository(Organizations)
    private readonly organizationsRepository: Repository<Organizations>,
    private readonly orgScopeService: OrgScopeService,
  ) {
    super(settingsRepository);
  }

  async bulkUpsert(
    dto: BulkUpsertOrganizationSettingsDto,
    user: AuthUserDto,
  ): Promise<OrganizationSettingDto[]> {
    const organizationId = await this.orgScopeService.resolveOrganizationId(
      user,
      dto.organizationId,
    );

    const organization = await this.organizationsRepository.findOne({
      where: { id: organizationId, deletedAt: IsNull() },
    });
    if (!organization) {
      throw new NotFoundException('Organisation introuvable.');
    }

    const saved = await this.settingsRepository.manager.transaction(
      async (manager) => {
        const repo = manager.getRepository(OrganizationSettings);
        const results: OrganizationSettings[] = [];

        for (const item of dto.settings) {
          const settingValue = validateSettingValue(
            item.settingKey,
            item.settingValue,
          );

          const existing = await repo.findOne({
            where: {
              organizationId,
              settingGroup: item.settingGroup,
              settingKey: item.settingKey,
            },
            withDeleted: true,
          });

          if (existing) {
            if (existing.deletedAt) {
              await repo.recover(existing);
            }
            const merged = repo.merge(existing, {
              settingValue,
              updatedByUserId: user.id,
            });
            results.push(await repo.save(merged));
            continue;
          }

          const entity = repo.create({
            id: newId(),
            organizationId,
            settingGroup: item.settingGroup,
            settingKey: item.settingKey,
            settingValue,
            createdByUserId: user.id,
          });
          results.push(await repo.save(entity));
        }

        return results;
      },
    );

    return saved.map(toOrganizationSettingDto);
  }

  async findPublicBranding(organizationSlug?: string): Promise<PublicBrandingDto> {
    const organization = await this.resolvePublicOrganization(organizationSlug);

    const platformSetting = await this.settingsRepository.findOne({
      where: {
        organizationId: organization.id,
        settingGroup: 'branding',
        settingKey: 'platform',
        deletedAt: IsNull(),
      },
    });

    const value =
      platformSetting?.settingValue && typeof platformSetting.settingValue === 'object'
        ? platformSetting.settingValue
        : {};

    const displayName =
      typeof value.displayName === 'string' && value.displayName.trim()
        ? value.displayName.trim()
        : organization.name?.trim() || DEFAULT_PUBLIC_BRANDING.displayName;

    return {
      displayName,
      primaryColor: normalizeHex(
        value.primaryColor,
        DEFAULT_PUBLIC_BRANDING.primaryColor,
      ),
      secondaryColor: normalizeHex(
        value.secondaryColor,
        DEFAULT_PUBLIC_BRANDING.secondaryColor,
      ),
      logoUrl:
        optionalAssetUrl(value.logoUrl) ??
        optionalAssetUrl(organization.logoUrl) ??
        null,
      faviconUrl:
        optionalAssetUrl(value.faviconUrl) ??
        optionalAssetUrl(organization.faviconUrl) ??
        null,
    };
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
}
