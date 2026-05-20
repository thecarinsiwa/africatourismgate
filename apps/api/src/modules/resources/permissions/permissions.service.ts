import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { Permissions } from '../../../entities/generated';
import { PermissionDto, toPermissionDto } from './dto/permission.dto';
import { PermissionsListQueryDto } from './dto/permissions-list-query.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permissions)
    private readonly permissionsRepository: Repository<Permissions>,
  ) {}

  async findAll(
    query: PermissionsListQueryDto,
  ): Promise<PaginatedResult<PermissionDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.permissionsRepository
      .createQueryBuilder('perm')
      .where('perm.deletedAt IS NULL');

    if (query.resource) {
      qb.andWhere('perm.resource = :resource', { resource: query.resource });
    }

    const search = query.search?.trim();
    if (search) {
      const pattern = `%${search.toLowerCase()}%`;
      qb.andWhere(
        new Brackets((sub) => {
          sub
            .where('LOWER(perm.code) LIKE :pattern', { pattern })
            .orWhere('LOWER(perm.resource) LIKE :pattern', { pattern })
            .orWhere('LOWER(perm.action) LIKE :pattern', { pattern });
        }),
      );
    }

    qb.orderBy('perm.resource', 'ASC')
      .addOrderBy('perm.action', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [rows, total] = await qb.getManyAndCount();

    return {
      data: rows.map(toPermissionDto),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(id: string): Promise<PermissionDto> {
    const perm = await this.permissionsRepository.findOne({ where: { id } });
    if (!perm || perm.deletedAt) {
      throw new NotFoundException(`Resource ${id} not found`);
    }
    return toPermissionDto(perm);
  }
}
