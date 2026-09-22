import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, IsNull, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
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
    private readonly addressesRepository: Repository<UserAddresses>,
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

  private async requireRow(id: string): Promise<UserAddresses> {
    const row = await this.addressesRepository.findOne({
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
    const rows = await this.addressesRepository.find({
      where: { userId, deletedAt: IsNull(), isDefault: 1 },
    });
    for (const row of rows) {
      if (exceptId && row.id === exceptId) continue;
      row.isDefault = 0;
      await this.addressesRepository.save(row);
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

    const [data, total] = await this.addressesRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: data.map(toUserAddressDto),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(id: string, currentUserId: string): Promise<UserAddressDto> {
    const row = await this.requireRow(id);
    const staff = await this.isStaffUser(currentUserId);
    if (!staff) {
      this.assertOwnership(row, currentUserId);
    }
    return toUserAddressDto(row);
  }

  async createFromDto(
    dto: CreateUserAddressDto,
    currentUserId: string,
  ): Promise<UserAddressDto> {
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

    const entity = this.addressesRepository.create({
      id: newId(),
      userId: targetUserId,
      label: dto.label?.trim() || null,
      line1: dto.line1.trim(),
      line2: dto.line2?.trim() || null,
      city: dto.city.trim(),
      region: dto.region?.trim() || null,
      postalCode: dto.postalCode?.trim() || null,
      countryCode: dto.countryCode.trim().toUpperCase(),
      isDefault,
      createdByUserId: currentUserId,
    });
    const saved = await this.addressesRepository.save(entity);
    return toUserAddressDto(saved);
  }

  async updateFromDto(
    id: string,
    dto: UpdateUserAddressDto,
    currentUserId: string,
  ): Promise<UserAddressDto> {
    const row = await this.requireRow(id);
    const staff = await this.isStaffUser(currentUserId);
    if (!staff) {
      this.assertOwnership(row, currentUserId);
    }

    if (dto.label !== undefined) {
      row.label = dto.label?.trim() || null;
    }
    if (dto.line1 !== undefined) {
      row.line1 = dto.line1.trim();
    }
    if (dto.line2 !== undefined) {
      row.line2 = dto.line2?.trim() || null;
    }
    if (dto.city !== undefined) {
      row.city = dto.city.trim();
    }
    if (dto.region !== undefined) {
      row.region = dto.region?.trim() || null;
    }
    if (dto.postalCode !== undefined) {
      row.postalCode = dto.postalCode?.trim() || null;
    }
    if (dto.countryCode !== undefined) {
      row.countryCode = dto.countryCode.trim().toUpperCase();
    }
    if (dto.isDefault !== undefined) {
      const nextDefault = dto.isDefault ? 1 : 0;
      if (nextDefault === 1) {
        await this.clearDefaultsForUser(row.userId, row.id);
      }
      row.isDefault = nextDefault;
    }

    row.updatedByUserId = currentUserId;
    const saved = await this.addressesRepository.save(row);
    return toUserAddressDto(saved);
  }

  async remove(id: string, currentUserId: string): Promise<void> {
    const row = await this.requireRow(id);
    const staff = await this.isStaffUser(currentUserId);
    if (!staff) {
      this.assertOwnership(row, currentUserId);
    }

    await this.addressesRepository.softDelete(id);
    await this.addressesRepository.update(id, {
      deletedByUserId: currentUserId,
    });
  }
}
