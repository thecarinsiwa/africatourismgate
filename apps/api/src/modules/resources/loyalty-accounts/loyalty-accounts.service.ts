import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DEFAULT_LOYALTY_ONEKEY_SETTING,
  type LoyaltyOneKeySettingValue,
} from '@africatourismgate/types';
import { FindOptionsWhere, IsNull, Repository } from 'typeorm';
import { PaginatedResult, PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { PLATFORM_ORG_ID } from '../../../common/org-scope/org-scope.service';
import { newId } from '../../../common/utils/uuid';
import { Bookings, LoyaltyAccounts, OrganizationSettings, Payments } from '../../../entities/generated';
import { PermissionsService } from '../../rbac/permissions.service';
import {
  CreateLoyaltyAccountDto,
  UpdateLoyaltyAccountDto,
} from './dto/loyalty-account.dto';

@Injectable()
export class LoyaltyAccountsService {
  constructor(
    @InjectRepository(LoyaltyAccounts)
    private readonly repository: Repository<LoyaltyAccounts>,
    @InjectRepository(OrganizationSettings)
    private readonly settingsRepository: Repository<OrganizationSettings>,
    private readonly permissionsService: PermissionsService,
  ) {}

  private async isStaffUser(userId: string): Promise<boolean> {
    return this.permissionsService.hasAnyPermission(userId, ['users.read']);
  }

  private assertOwnership(row: LoyaltyAccounts, userId: string): void {
    if (row.userId !== userId) {
      throw new ForbiddenException('Access denied.');
    }
  }

  async getLoyaltyConfig(): Promise<LoyaltyOneKeySettingValue> {
    const row = await this.settingsRepository.findOne({
      where: {
        organizationId: PLATFORM_ORG_ID,
        settingGroup: 'loyalty',
        settingKey: 'onekey',
        deletedAt: IsNull(),
      },
    });
    const raw = row?.settingValue ?? {};
    const enabled = typeof raw.enabled === 'boolean' ? raw.enabled : DEFAULT_LOYALTY_ONEKEY_SETTING.enabled;
    const pointsPerMajorUnit =
      typeof raw.pointsPerMajorUnit === 'number' &&
      Number.isInteger(raw.pointsPerMajorUnit) &&
      raw.pointsPerMajorUnit >= 0
        ? raw.pointsPerMajorUnit
        : DEFAULT_LOYALTY_ONEKEY_SETTING.pointsPerMajorUnit;
    const programCode =
      typeof raw.programCode === 'string' && raw.programCode.trim()
        ? raw.programCode.trim().toUpperCase()
        : DEFAULT_LOYALTY_ONEKEY_SETTING.programCode;
    return { enabled, pointsPerMajorUnit, programCode };
  }

  async findAll(
    query: PaginationQueryDto,
    currentUserId: string,
  ): Promise<PaginatedResult<LoyaltyAccounts>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const staff = await this.isStaffUser(currentUserId);

    const where: FindOptionsWhere<LoyaltyAccounts> = { deletedAt: IsNull() };
    if (!staff) {
      where.userId = currentUserId;
    }

    const [data, total] = await this.repository.findAndCount({
      where,
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

  async findOne(id: string, currentUserId: string): Promise<LoyaltyAccounts> {
    const row = await this.repository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!row) {
      throw new NotFoundException(`Resource ${id} not found`);
    }
    const staff = await this.isStaffUser(currentUserId);
    if (!staff) {
      this.assertOwnership(row, currentUserId);
    }
    return row;
  }

  async getOrCreateForUser(
    userId: string,
    programCode: string,
  ): Promise<LoyaltyAccounts> {
    const code = programCode.trim().toUpperCase();
    const existing = await this.repository.findOne({
      where: {
        userId,
        programCode: code,
        deletedAt: IsNull(),
      },
    });
    if (existing) {
      return existing;
    }

    const entity = this.repository.create({
      id: newId(),
      userId,
      programCode: code,
      pointsBalance: 0,
      tier: 'member',
      createdByUserId: null,
    } as LoyaltyAccounts);

    return this.repository.save(entity);
  }

  /**
   * Crédite les points OneKey lors du premier passage du paiement à succeeded.
   * Appeler uniquement depuis le flux non idempotent (pas si payment.status était déjà succeeded).
   */
  async awardPointsForSucceededPayment(
    booking: Bookings,
    payment: Payments,
  ): Promise<void> {
    const config = await this.getLoyaltyConfig();
    if (!config.enabled || config.pointsPerMajorUnit < 1) {
      return;
    }

    const points =
      Math.floor(payment.amountCents / 100) * config.pointsPerMajorUnit;
    if (points < 1) {
      return;
    }

    const account = await this.getOrCreateForUser(booking.userId, config.programCode);
    account.pointsBalance += points;
    await this.repository.save(account);
  }

  async create(
    dto: CreateLoyaltyAccountDto,
    currentUserId: string,
  ): Promise<LoyaltyAccounts> {
    const staff = await this.isStaffUser(currentUserId);
    if (!staff) {
      throw new ForbiddenException('Access denied.');
    }

    const programCode = (dto.programCode?.trim() || 'ONEKEY').toUpperCase();
    const targetUserId = dto.userId ?? currentUserId;

    const entity = this.repository.create({
      id: newId(),
      userId: targetUserId,
      programCode,
      pointsBalance: dto.pointsBalance ?? 0,
      tier: dto.tier ?? 'member',
      createdByUserId: currentUserId,
    } as LoyaltyAccounts);

    return this.repository.save(entity);
  }

  async update(
    id: string,
    dto: UpdateLoyaltyAccountDto,
    currentUserId: string,
  ): Promise<LoyaltyAccounts> {
    const existing = await this.findOne(id, currentUserId);
    const staff = await this.isStaffUser(currentUserId);
    if (!staff) {
      throw new ForbiddenException('Access denied.');
    }

    const merged = this.repository.merge(existing, {
      ...(dto.programCode !== undefined
        ? { programCode: dto.programCode.trim().toUpperCase() }
        : {}),
      ...(dto.tier !== undefined ? { tier: dto.tier } : {}),
      ...(dto.pointsBalance !== undefined ? { pointsBalance: dto.pointsBalance } : {}),
      updatedByUserId: currentUserId,
    } as Partial<LoyaltyAccounts>);

    return this.repository.save(merged);
  }

  async remove(id: string, currentUserId: string): Promise<void> {
    const staff = await this.isStaffUser(currentUserId);
    if (!staff) {
      throw new ForbiddenException('Access denied.');
    }
    await this.findOne(id, currentUserId);
    await this.repository.softDelete(id);
    await this.repository.update(id, { deletedByUserId: currentUserId });
  }
}
