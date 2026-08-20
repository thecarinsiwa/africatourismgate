import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import {
  AUTH_VISUAL_ICON_POSITIONS,
  AUTH_VISUAL_ICON_PRESETS,
  AUTH_VISUAL_ICON_SIZES,
  DEFAULT_AUTH_VISUAL_ICONS,
} from './auth-visual.constants';
import type {
  AuthVisualDecorIcon,
  PublicAuthVisual,
  PublicAuthVisualIcon,
  ResolvedBookingItemTypeModes,
} from '@africatourismgate/types';
import {
  DEFAULT_BOOKING_ITEM_TYPE_MODES,
  normalizeBookingItemTypeModes,
} from '@africatourismgate/types';
import { OrgScopeService, PLATFORM_ORG_ID } from '../../../common/org-scope/org-scope.service';
import { CrudService } from '../../../common/crud/crud.service';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
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
import { PublicContactDto } from './dto/public-contact.dto';
import { PublicBookingModesDto } from './dto/public-booking-modes.dto';
import { OrganizationSettingsListQueryDto } from './dto/organization-settings-list-query.dto';
import { validateSettingValue } from './validate-setting-value';

const DEFAULT_PUBLIC_BRANDING: PublicBrandingDto = {
  displayName: 'Africa Tourism Gate',
  primaryColor: '#0B6E4F',
  secondaryColor: '#199a45',
  logoUrl: null,
  faviconUrl: null,
};

const DEFAULT_PUBLIC_CONTACT: PublicContactDto = {
  phone: '+243 815 000 000',
  email: 'support@africatourismgate.com',
  location: 'Kinshasa, RD Congo',
  facebookUrl: 'https://www.facebook.com/africatourismgate/',
  twitterUrl: 'https://x.com/Congotourismga1',
  instagramUrl: 'https://www.instagram.com/africatourismgate/',
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

function optionalPublicString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function normalizeAuthVisualIcon(raw: unknown): PublicAuthVisualIcon | null {
  if (!raw || typeof raw !== 'object') return null;
  const icon = raw as Record<string, unknown>;
  const preset = icon.preset;
  if (
    typeof preset !== 'string' ||
    !AUTH_VISUAL_ICON_PRESETS.includes(preset as AuthVisualDecorIcon['preset'])
  ) {
    return null;
  }
  const position = icon.position;
  if (
    typeof position !== 'string' ||
    !AUTH_VISUAL_ICON_POSITIONS.includes(position as AuthVisualDecorIcon['position'])
  ) {
    return null;
  }
  const size = icon.size;
  if (
    typeof size !== 'string' ||
    !AUTH_VISUAL_ICON_SIZES.includes(size as AuthVisualDecorIcon['size'])
  ) {
    return null;
  }
  const opacity = icon.opacity;
  if (typeof opacity !== 'number' || opacity < 0 || opacity > 100) {
    return null;
  }
  const enabled = icon.enabled;
  if (typeof enabled !== 'boolean') return null;

  const imageUrl = optionalAssetUrl(icon.imageUrl);
  if (preset === 'custom' && !imageUrl) return null;

  return {
    preset: preset as AuthVisualDecorIcon['preset'],
    position: position as AuthVisualDecorIcon['position'],
    size: size as AuthVisualDecorIcon['size'],
    opacity: Math.round(opacity),
    enabled,
    imageUrl,
  };
}

function resolvePublicAuthVisual(
  settingValue: unknown,
  hasSetting: boolean,
): PublicAuthVisual {
  if (!hasSetting) {
    return {
      icons: DEFAULT_AUTH_VISUAL_ICONS.map((icon) => ({
        ...icon,
        imageUrl: icon.imageUrl ?? null,
      })),
    };
  }

  const iconsRaw =
    settingValue &&
    typeof settingValue === 'object' &&
    Array.isArray((settingValue as { icons?: unknown }).icons)
      ? ((settingValue as { icons: unknown[] }).icons ?? [])
      : [];

  const icons = iconsRaw
    .map((icon) => normalizeAuthVisualIcon(icon))
    .filter((icon): icon is PublicAuthVisualIcon => icon !== null);

  return { icons };
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

  async findAllScoped(
    query: OrganizationSettingsListQueryDto,
    user: AuthUserDto,
  ): Promise<PaginatedResult<OrganizationSettings>> {
    const organizationId = await this.orgScopeService.resolveOrganizationId(
      user,
      query.organizationId,
    );

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const [data, total] = await this.settingsRepository.findAndCount({
      where: { organizationId, deletedAt: IsNull() },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

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

    const authVisualSetting = await this.settingsRepository.findOne({
      where: {
        organizationId: organization.id,
        settingGroup: 'branding',
        settingKey: 'auth_visual',
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
      authVisual: resolvePublicAuthVisual(
        authVisualSetting?.settingValue,
        Boolean(authVisualSetting),
      ),
    };
  }

  async findPublicContact(organizationSlug?: string): Promise<PublicContactDto> {
    const organization = await this.resolvePublicOrganization(organizationSlug);

    const contactSetting = await this.settingsRepository.findOne({
      where: {
        organizationId: organization.id,
        settingGroup: 'contact',
        settingKey: 'web',
        deletedAt: IsNull(),
      },
    });

    const value =
      contactSetting?.settingValue && typeof contactSetting.settingValue === 'object'
        ? contactSetting.settingValue
        : {};

    return {
      phone:
        optionalPublicString(organization.contactPhone) ?? DEFAULT_PUBLIC_CONTACT.phone,
      email:
        optionalPublicString(organization.contactEmail) ?? DEFAULT_PUBLIC_CONTACT.email,
      location:
        optionalPublicString(value.location) ?? DEFAULT_PUBLIC_CONTACT.location,
      facebookUrl:
        optionalPublicString(value.facebookUrl) ?? DEFAULT_PUBLIC_CONTACT.facebookUrl,
      twitterUrl:
        optionalPublicString(value.twitterUrl) ?? DEFAULT_PUBLIC_CONTACT.twitterUrl,
      instagramUrl:
        optionalPublicString(value.instagramUrl) ?? DEFAULT_PUBLIC_CONTACT.instagramUrl,
    };
  }

  async findPublicBookingModes(organizationSlug?: string): Promise<PublicBookingModesDto> {
    const organization = await this.resolvePublicOrganization(organizationSlug);
    return this.getResolvedItemTypeModes(organization.id);
  }

  async getResolvedItemTypeModes(
    organizationId: string = PLATFORM_ORG_ID,
  ): Promise<ResolvedBookingItemTypeModes> {
    const setting = await this.settingsRepository.findOne({
      where: {
        organizationId,
        settingGroup: 'booking',
        settingKey: 'item_type_modes',
        deletedAt: IsNull(),
      },
    });

    if (
      !setting?.settingValue ||
      typeof setting.settingValue !== 'object' ||
      Array.isArray(setting.settingValue)
    ) {
      return { ...DEFAULT_BOOKING_ITEM_TYPE_MODES };
    }

    return normalizeBookingItemTypeModes(
      setting.settingValue as Partial<ResolvedBookingItemTypeModes>,
    );
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
