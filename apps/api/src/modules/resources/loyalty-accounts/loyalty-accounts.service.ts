import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { LoyaltyOneKeySettingValue } from '@africatourismgate/types';
import { DEFAULT_LOYALTY_ONEKEY_SETTING } from './loyalty-defaults';
import { FindOptionsWhere, IsNull, Repository } from 'typeorm';
import { PaginatedResult, PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { PLATFORM_ORG_ID } from '../../../common/org-scope/org-scope.service';
import { newId } from '../../../common/utils/uuid';
import {
  Bookings,
  LoyaltyAccounts,
  OrganizationSettings,
  Payments,
  Users,
} from '../../../entities/generated';
import { PermissionsService } from '../../rbac/permissions.service';
import { AdjustLoyaltyPointsDto } from './dto/adjust-loyalty-points.dto';
import { AdminLoyaltyAccountListItemDto } from './dto/admin-loyalty-account-list-item.dto';
import {
  CreateLoyaltyAccountDto,
  UpdateLoyaltyAccountDto,
} from './dto/loyalty-account.dto';

type AdminLoyaltyRow = {
  id: string;
  userId: string;
  userEmail: string;
  userFirstName: string;
  userLastName: string;
  programCode: string;
  pointsBalance: number;
  tier: LoyaltyAccounts['tier'];
  createdAt: Date;
  updatedAt: Date | null;
};

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
    if (await this.permissionsService.hasSuperAdminRole(userId)) {
      return true;
    }
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
  ): Promise<PaginatedResult<LoyaltyAccounts | AdminLoyaltyAccountListItemDto>> {
    const staff = await this.isStaffUser(currentUserId);
    if (staff) {
      return this.listForAdmin(query);
    }
    return this.listForCustomer(query, currentUserId);
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

  async adjustPoints(
    id: string,
    dto: AdjustLoyaltyPointsDto,
    actorUserId: string,
  ): Promise<AdminLoyaltyAccountListItemDto> {
    const isSuperAdmin = await this.permissionsService.hasSuperAdminRole(actorUserId);
    if (!isSuperAdmin) {
      throw new ForbiddenException('Réservé au super administrateur');
    }

    const account = await this.repository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!account) {
      throw new NotFoundException('Compte fidélité introuvable.');
    }

    const newBalance = account.pointsBalance + dto.delta;
    if (newBalance < 0) {
      throw new BadRequestException('Le solde ne peut pas être négatif.');
    }

    account.pointsBalance = newBalance;
    account.updatedByUserId = actorUserId;
    await this.repository.save(account);

    return this.findOneForAdmin(id);
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

  private async listForCustomer(
    query: PaginationQueryDto,
    userId: string,
  ): Promise<PaginatedResult<LoyaltyAccounts>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const [data, total] = await this.repository.findAndCount({
      where: { userId, deletedAt: IsNull() },
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

  private async listForAdmin(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<AdminLoyaltyAccountListItemDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.repository
      .createQueryBuilder('la')
      .innerJoin(Users, 'u', 'u.id = la.userId AND u.deletedAt IS NULL')
      .select('la.id', 'id')
      .addSelect('la.userId', 'userId')
      .addSelect('u.email', 'userEmail')
      .addSelect('u.firstName', 'userFirstName')
      .addSelect('u.lastName', 'userLastName')
      .addSelect('la.programCode', 'programCode')
      .addSelect('la.pointsBalance', 'pointsBalance')
      .addSelect('la.tier', 'tier')
      .addSelect('la.createdAt', 'createdAt')
      .addSelect('la.updatedAt', 'updatedAt')
      .where('la.deletedAt IS NULL')
      .orderBy('COALESCE(la.updatedAt, la.createdAt)', 'DESC')
      .offset((page - 1) * limit)
      .limit(limit);

    const countQb = this.repository
      .createQueryBuilder('la')
      .where('la.deletedAt IS NULL');

    const [rows, total] = await Promise.all([
      qb.getRawMany<AdminLoyaltyRow>(),
      countQb.getCount(),
    ]);

    return {
      data: rows.map((row) => this.toAdminListItemDto(row)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  private async findOneForAdmin(id: string): Promise<AdminLoyaltyAccountListItemDto> {
    const row = await this.repository
      .createQueryBuilder('la')
      .innerJoin(Users, 'u', 'u.id = la.userId AND u.deletedAt IS NULL')
      .select('la.id', 'id')
      .addSelect('la.userId', 'userId')
      .addSelect('u.email', 'userEmail')
      .addSelect('u.firstName', 'userFirstName')
      .addSelect('u.lastName', 'userLastName')
      .addSelect('la.programCode', 'programCode')
      .addSelect('la.pointsBalance', 'pointsBalance')
      .addSelect('la.tier', 'tier')
      .addSelect('la.createdAt', 'createdAt')
      .addSelect('la.updatedAt', 'updatedAt')
      .where('la.id = :id', { id })
      .andWhere('la.deletedAt IS NULL')
      .getRawOne<AdminLoyaltyRow>();

    if (!row) {
      throw new NotFoundException('Compte fidélité introuvable.');
    }

    return this.toAdminListItemDto(row);
  }

  private toAdminListItemDto(row: AdminLoyaltyRow): AdminLoyaltyAccountListItemDto {
    const createdAt =
      row.createdAt instanceof Date
        ? row.createdAt.toISOString()
        : new Date(row.createdAt).toISOString();
    const updatedAt =
      row.updatedAt == null
        ? null
        : row.updatedAt instanceof Date
          ? row.updatedAt.toISOString()
          : new Date(row.updatedAt).toISOString();

    return {
      id: row.id,
      userId: row.userId,
      userEmail: row.userEmail,
      userFirstName: row.userFirstName,
      userLastName: row.userLastName,
      programCode: row.programCode,
      pointsBalance: Number(row.pointsBalance),
      tier: row.tier,
      lastActivityAt: updatedAt ?? createdAt,
      createdAt,
      updatedAt,
    };
  }
}
