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
    private readonly repository: Repository<UserPaymentMethods>,
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

    const [rows, total] = await this.repository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: rows.map(toUserPaymentMethodDto),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(id: string, currentUserId: string): Promise<UserPaymentMethodDto> {
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
    return toUserPaymentMethodDto(row);
  }

  async create(
    dto: CreateUserPaymentMethodDto,
    currentUserId: string,
  ): Promise<UserPaymentMethodDto> {
    const staff = await this.isStaffUser(currentUserId);
    const targetUserId = staff && dto.userId ? dto.userId : currentUserId;

    const entity = this.repository.create({
      id: newId(),
      userId: targetUserId,
      type: dto.type,
      provider: dto.provider?.trim() || null,
      lastFour: dto.lastFour?.trim() || null,
      externalToken: dto.externalToken?.trim() || null,
      isDefault: dto.isDefault ? 1 : 0,
      createdByUserId: currentUserId,
    } as UserPaymentMethods);

    const saved = await this.repository.save(entity);
    return toUserPaymentMethodDto(saved);
  }

  async update(
    id: string,
    dto: UpdateUserPaymentMethodDto,
    currentUserId: string,
  ): Promise<UserPaymentMethodDto> {
    const existing = await this.repository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!existing) {
      throw new NotFoundException(`Resource ${id} not found`);
    }

    const staff = await this.isStaffUser(currentUserId);
    if (!staff) {
      this.assertOwnership(existing, currentUserId);
    }

    const merged = this.repository.merge(existing, {
      ...(dto.type !== undefined ? { type: dto.type } : {}),
      ...(dto.provider !== undefined ? { provider: dto.provider?.trim() || null } : {}),
      ...(dto.lastFour !== undefined ? { lastFour: dto.lastFour?.trim() || null } : {}),
      ...(dto.externalToken !== undefined
        ? { externalToken: dto.externalToken?.trim() || null }
        : {}),
      ...(dto.isDefault !== undefined ? { isDefault: dto.isDefault ? 1 : 0 } : {}),
      updatedByUserId: currentUserId,
    } as Partial<UserPaymentMethods>);

    const saved = await this.repository.save(merged);
    return toUserPaymentMethodDto(saved);
  }

  async remove(id: string, currentUserId: string): Promise<void> {
    const existing = await this.repository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!existing) {
      throw new NotFoundException(`Resource ${id} not found`);
    }

    const staff = await this.isStaffUser(currentUserId);
    if (!staff) {
      this.assertOwnership(existing, currentUserId);
    }

    await this.repository.softDelete(id);
    await this.repository.update(id, { deletedByUserId: currentUserId });
  }
}
