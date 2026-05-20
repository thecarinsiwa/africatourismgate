import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { OrgScopeService } from '../../../common/org-scope/org-scope.service';
import { newId } from '../../../common/utils/uuid';
import { OrganizationSettings } from '../../../entities/generated';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { BulkUpsertOrganizationSettingsDto } from './dto/bulk-upsert-organization-settings.dto';
import {
  OrganizationSettingDto,
  toOrganizationSettingDto,
} from './dto/organization-setting.dto';
import { OrganizationSettingsListQueryDto } from './dto/organization-settings-list-query.dto';
import { validateSettingValue } from './validate-setting-value';

@Injectable()
export class OrganizationSettingsService {
  constructor(
    @InjectRepository(OrganizationSettings)
    private readonly settingsRepository: Repository<OrganizationSettings>,
    private readonly orgScope: OrgScopeService,
  ) {}

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
