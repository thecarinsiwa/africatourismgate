import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, IsNull, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { newId } from '../../../common/utils/uuid';
import { UserPaymentMethods } from '../../../entities/generated';
import { PermissionsService } from '../../rbac/permissions.service';
import {
  CreateUserPaymentMethodDto,
  toUserPaymentMethodDto,
  UpdateUserPaymentMethodDto,
  UserPaymentMethodDto,
} from './dto/user-payment-method.dto';
import { UserPaymentMethodsListQueryDto } from './dto/user-payment-methods-list-query.dto';

@Injectable()
export class UserPaymentMethodsService {
  constructor(
    @InjectRepository(UserPaymentMethods)
    private readonly paymentMethodsRepository: Repository<UserPaymentMethods>,
    private readonly permissionsService: PermissionsService,
  ) {}

  private async isStaffUser(userId: string): Promise<boolean> {
    if (await this.permissionsService.hasSuperAdminRole(userId)) {
      return true;
    }
    return this.permissionsService.hasAnyPermission(userId, ['users.read']);
  }

  private assertOwnership(row: UserPaymentMethods, userId: string): void {
    if (row.userId !== userId) {
      throw new ForbiddenException('Access denied.');
    }
  }

  private async requireRow(id: string): Promise<UserPaymentMethods> {
    const row = await this.paymentMethodsRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!row) {
      throw new NotFoundException(`Resource ${id} not found`);
    }
    return row;
  }

  private async clearDefaultsForUser(
    userId: string,
    exceptId?: string,
  ): Promise<void> {
    const rows = await this.paymentMethodsRepository.find({
      where: { userId, deletedAt: IsNull(), isDefault: 1 },
    });
    for (const row of rows) {
      if (exceptId && row.id === exceptId) continue;
      row.isDefault = 0;
      await this.paymentMethodsRepository.save(row);
    }
  }

  async findAll(
    query: UserPaymentMethodsListQueryDto,
    currentUserId: string,
  ): Promise<PaginatedResult<UserPaymentMethodDto>> {
    const staff = await this.isStaffUser(currentUserId);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: FindOptionsWhere<UserPaymentMethods> = { deletedAt: IsNull() };
    if (staff) {
      if (query.userId) {
        where.userId = query.userId;
      }
    } else {
      where.userId = currentUserId;
    }

    const [data, total] = await this.paymentMethodsRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: data.map(toUserPaymentMethodDto),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(
    id: string,
    currentUserId: string,
  ): Promise<UserPaymentMethodDto> {
    const row = await this.requireRow(id);
    const staff = await this.isStaffUser(currentUserId);
    if (!staff) {
      this.assertOwnership(row, currentUserId);
    }
    return toUserPaymentMethodDto(row);
  }

  async createFromDto(
    dto: CreateUserPaymentMethodDto,
    currentUserId: string,
  ): Promise<UserPaymentMethodDto> {
    const staff = await this.isStaffUser(currentUserId);
    const targetUserId =
      staff && dto.userId?.trim() ? dto.userId.trim() : currentUserId;

    if (!staff && dto.userId && dto.userId !== currentUserId) {
      throw new ForbiddenException('Access denied.');
    }

    const isDefault = dto.isDefault === true ? 1 : 0;
    if (isDefault) {
      await this.clearDefaultsForUser(targetUserId);
    }

    const entity = this.paymentMethodsRepository.create({
      id: newId(),
      userId: targetUserId,
      type: dto.type,
      provider: dto.provider?.trim() || null,
      lastFour: dto.lastFour?.trim() || null,
      externalToken: dto.externalToken?.trim() || null,
      isDefault,
      createdByUserId: currentUserId,
    });
    const saved = await this.paymentMethodsRepository.save(entity);
    return toUserPaymentMethodDto(saved);
  }

  async updateFromDto(
    id: string,
    dto: UpdateUserPaymentMethodDto,
    currentUserId: string,
  ): Promise<UserPaymentMethodDto> {
    const row = await this.requireRow(id);
    const staff = await this.isStaffUser(currentUserId);
    if (!staff) {
      this.assertOwnership(row, currentUserId);
    }

    if (dto.type !== undefined) {
      row.type = dto.type;
    }
    if (dto.provider !== undefined) {
      row.provider = dto.provider?.trim() || null;
    }
    if (dto.lastFour !== undefined) {
      row.lastFour = dto.lastFour?.trim() || null;
    }
    if (dto.externalToken !== undefined) {
      row.externalToken = dto.externalToken?.trim() || null;
    }
    if (dto.isDefault !== undefined) {
      const nextDefault = dto.isDefault ? 1 : 0;
      if (nextDefault === 1) {
        await this.clearDefaultsForUser(row.userId, row.id);
      }
      row.isDefault = nextDefault;
    }

    row.updatedByUserId = currentUserId;
    const saved = await this.paymentMethodsRepository.save(row);
    return toUserPaymentMethodDto(saved);
  }

  async remove(id: string, currentUserId: string): Promise<void> {
    const row = await this.requireRow(id);
    const staff = await this.isStaffUser(currentUserId);
    if (!staff) {
      this.assertOwnership(row, currentUserId);
    }

    await this.paymentMethodsRepository.softDelete(id);
    await this.paymentMethodsRepository.update(id, {
      deletedByUserId: currentUserId,
    });
  }
}
