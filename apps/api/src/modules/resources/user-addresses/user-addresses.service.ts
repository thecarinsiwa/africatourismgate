import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, IsNull, Repository } from 'typeorm';
import { PaginatedResult, PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { newId } from '../../../common/utils/uuid';
import { UserAddresses } from '../../../entities/generated';
import { PermissionsService } from '../../rbac/permissions.service';
import {
  CreateUserAddressDto,
  UpdateUserAddressDto,
} from './dto/user-address.dto';

@Injectable()
export class UserAddressesService {
  constructor(
    @InjectRepository(UserAddresses)
    private readonly repository: Repository<UserAddresses>,
    private readonly permissionsService: PermissionsService,
  ) {}

  private async isStaffUser(userId: string): Promise<boolean> {
    return this.permissionsService.hasAnyPermission(userId, ['users.read']);
  }

  private assertOwnership(row: UserAddresses, userId: string): void {
    if (row.userId !== userId) {
      throw new ForbiddenException('Access denied.');
    }
  }

  async findAll(
    query: PaginationQueryDto,
    currentUserId: string,
  ): Promise<PaginatedResult<UserAddresses>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const staff = await this.isStaffUser(currentUserId);

    const where: FindOptionsWhere<UserAddresses> = { deletedAt: IsNull() };
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

  async findOne(id: string, currentUserId: string): Promise<UserAddresses> {
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
    dto: CreateUserAddressDto,
    currentUserId: string,
  ): Promise<UserAddresses> {
    const staff = await this.isStaffUser(currentUserId);
    const targetUserId =
      staff && dto.userId ? dto.userId : currentUserId;

    const entity = this.repository.create({
      id: newId(),
      userId: targetUserId,
      label: dto.label?.trim() ?? null,
      line1: dto.line1.trim(),
      line2: dto.line2?.trim() ?? null,
      city: dto.city.trim(),
      region: dto.region?.trim() ?? null,
      postalCode: dto.postalCode?.trim() ?? null,
      countryCode: dto.countryCode.trim(),
      isDefault: dto.isDefault ? 1 : 0,
      createdByUserId: currentUserId,
    } as UserAddresses);

    return this.repository.save(entity);
  }

  async update(
    id: string,
    dto: UpdateUserAddressDto,
    currentUserId: string,
  ): Promise<UserAddresses> {
    const existing = await this.findOne(id, currentUserId);
    const merged = this.repository.merge(existing, {
      ...(dto.label !== undefined ? { label: dto.label?.trim() ?? null } : {}),
      ...(dto.line1 !== undefined ? { line1: dto.line1.trim() } : {}),
      ...(dto.line2 !== undefined ? { line2: dto.line2?.trim() ?? null } : {}),
      ...(dto.city !== undefined ? { city: dto.city.trim() } : {}),
      ...(dto.region !== undefined ? { region: dto.region?.trim() ?? null } : {}),
      ...(dto.postalCode !== undefined
        ? { postalCode: dto.postalCode?.trim() ?? null }
        : {}),
      ...(dto.countryCode !== undefined
        ? { countryCode: dto.countryCode.trim() }
        : {}),
      ...(dto.isDefault !== undefined ? { isDefault: dto.isDefault ? 1 : 0 } : {}),
      updatedByUserId: currentUserId,
    } as Partial<UserAddresses>);

    return this.repository.save(merged);
  }

  async remove(id: string, currentUserId: string): Promise<void> {
    await this.findOne(id, currentUserId);
    await this.repository.softDelete(id);
    await this.repository.update(id, { deletedByUserId: currentUserId });
  }
}
