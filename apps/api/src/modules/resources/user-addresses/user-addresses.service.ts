import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, IsNull, Repository } from 'typeorm';
import {
  PaginatedResult,
} from '../../../common/dto/pagination-query.dto';
import { newId } from '../../../common/utils/uuid';
import { UserAddresses } from '../../../entities/generated';
import { PermissionsService } from '../../rbac/permissions.service';
import {
  CreateUserAddressDto,
  toUserAddressDto,
  UpdateUserAddressDto,
  UserAddressDto,
} from './dto/user-address.dto';
import { UserAddressesListQueryDto } from './dto/user-addresses-list-query.dto';

@Injectable()
export class UserAddressesService {
  constructor(
    @InjectRepository(UserAddresses)
    private readonly repository: Repository<UserAddresses>,
    private readonly permissionsService: PermissionsService,
  ) {}

  private async isStaffUser(userId: string): Promise<boolean> {
    if (await this.permissionsService.hasSuperAdminRole(userId)) {
      return true;
    }
    return this.permissionsService.hasAnyPermission(userId, ['users.read']);
  }

  private assertOwnership(row: UserAddresses, userId: string): void {
    if (row.userId !== userId) {
      throw new ForbiddenException('Access denied.');
    }
  }

  async findAll(
    query: UserAddressesListQueryDto,
    currentUserId: string,
  ): Promise<PaginatedResult<UserAddressDto>> {
    const staff = await this.isStaffUser(currentUserId);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: FindOptionsWhere<UserAddresses> = { deletedAt: IsNull() };
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
      data: rows.map(toUserAddressDto),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(id: string, currentUserId: string): Promise<UserAddressDto> {
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
    return toUserAddressDto(row);
  }

  async create(
    dto: CreateUserAddressDto,
    currentUserId: string,
  ): Promise<UserAddressDto> {
    const staff = await this.isStaffUser(currentUserId);
    const targetUserId = staff && dto.userId ? dto.userId : currentUserId;

    const entity = this.repository.create({
      id: newId(),
      userId: targetUserId,
      label: dto.label?.trim() || null,
      line1: dto.line1,
      line2: dto.line2?.trim() || null,
      city: dto.city,
      region: dto.region?.trim() || null,
      postalCode: dto.postalCode?.trim() || null,
      countryCode: dto.countryCode,
      isDefault: dto.isDefault ? 1 : 0,
      createdByUserId: currentUserId,
    } as UserAddresses);

    const saved = await this.repository.save(entity);
    return toUserAddressDto(saved);
  }

  async update(
    id: string,
    dto: UpdateUserAddressDto,
    currentUserId: string,
  ): Promise<UserAddressDto> {
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
      ...(dto.label !== undefined ? { label: dto.label?.trim() || null } : {}),
      ...(dto.line1 !== undefined ? { line1: dto.line1 } : {}),
      ...(dto.line2 !== undefined ? { line2: dto.line2?.trim() || null } : {}),
      ...(dto.city !== undefined ? { city: dto.city } : {}),
      ...(dto.region !== undefined ? { region: dto.region?.trim() || null } : {}),
      ...(dto.postalCode !== undefined
        ? { postalCode: dto.postalCode?.trim() || null }
        : {}),
      ...(dto.countryCode !== undefined ? { countryCode: dto.countryCode } : {}),
      ...(dto.isDefault !== undefined ? { isDefault: dto.isDefault ? 1 : 0 } : {}),
      updatedByUserId: currentUserId,
    } as Partial<UserAddresses>);

    const saved = await this.repository.save(merged);
    return toUserAddressDto(saved);
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
