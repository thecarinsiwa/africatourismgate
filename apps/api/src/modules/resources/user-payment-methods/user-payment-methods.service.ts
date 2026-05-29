import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, IsNull, Repository } from 'typeorm';
import { PaginatedResult, PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { newId } from '../../../common/utils/uuid';
import { UserPaymentMethods } from '../../../entities/generated';
import { PermissionsService } from '../../rbac/permissions.service';
import {
  CreateUserPaymentMethodDto,
  UpdateUserPaymentMethodDto,
} from './dto/user-payment-method.dto';

@Injectable()
export class UserPaymentMethodsService {
  constructor(
    @InjectRepository(UserPaymentMethods)
    private readonly repository: Repository<UserPaymentMethods>,
    private readonly permissionsService: PermissionsService,
  ) {}

  private async isStaffUser(userId: string): Promise<boolean> {
    return this.permissionsService.hasAnyPermission(userId, ['users.read']);
  }

  private assertOwnership(row: UserPaymentMethods, userId: string): void {
    if (row.userId !== userId) {
      throw new ForbiddenException('Access denied.');
    }
  }

  async findAll(
    query: PaginationQueryDto,
    currentUserId: string,
  ): Promise<PaginatedResult<UserPaymentMethods>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const staff = await this.isStaffUser(currentUserId);

    const where: FindOptionsWhere<UserPaymentMethods> = { deletedAt: IsNull() };
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

  async findOne(id: string, currentUserId: string): Promise<UserPaymentMethods> {
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

  async create(
    dto: CreateUserPaymentMethodDto,
    currentUserId: string,
  ): Promise<UserPaymentMethods> {
    const staff = await this.isStaffUser(currentUserId);
    const targetUserId =
      staff && dto.userId ? dto.userId : currentUserId;

    const entity = this.repository.create({
      id: newId(),
      userId: targetUserId,
      type: dto.type,
      provider: dto.provider?.trim() ?? null,
      lastFour: dto.lastFour?.trim() ?? null,
      externalToken: dto.externalToken?.trim() ?? null,
      isDefault: dto.isDefault ? 1 : 0,
      createdByUserId: currentUserId,
    } as UserPaymentMethods);

    return this.repository.save(entity);
  }

  async update(
    id: string,
    dto: UpdateUserPaymentMethodDto,
    currentUserId: string,
  ): Promise<UserPaymentMethods> {
    const existing = await this.findOne(id, currentUserId);

    const merged = this.repository.merge(existing, {
      ...(dto.type !== undefined ? { type: dto.type } : {}),
      ...(dto.provider !== undefined
        ? { provider: dto.provider?.trim() ?? null }
        : {}),
      ...(dto.lastFour !== undefined
        ? { lastFour: dto.lastFour?.trim() ?? null }
        : {}),
      ...(dto.externalToken !== undefined
        ? { externalToken: dto.externalToken?.trim() ?? null }
        : {}),
      ...(dto.isDefault !== undefined ? { isDefault: dto.isDefault ? 1 : 0 } : {}),
      updatedByUserId: currentUserId,
    } as Partial<UserPaymentMethods>);

    return this.repository.save(merged);
  }

  async remove(id: string, currentUserId: string): Promise<void> {
    await this.findOne(id, currentUserId);
    await this.repository.softDelete(id);
    await this.repository.update(id, { deletedByUserId: currentUserId });
  }
}
