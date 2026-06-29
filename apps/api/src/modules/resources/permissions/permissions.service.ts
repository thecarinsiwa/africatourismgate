import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { Permissions } from '../../../entities/generated';
import { PermissionDto, toPermissionDto } from './dto/permission.dto';
import { PermissionsListQueryDto } from './dto/permissions-list-query.dto';

@Injectable()
export class PermissionsService extends CrudService<Permissions> {
  constructor(
    @InjectRepository(Permissions)
    private readonly permissionsRepository: Repository<Permissions>,
  ) {
    super(permissionsRepository);
  }

  async list(query: PermissionsListQueryDto): Promise<PaginatedResult<PermissionDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.permissionsRepository
      .createQueryBuilder('perm')
      .where('perm.deletedAt IS NULL');

    const resource = query.resource?.trim();
    if (resource) {
      qb.andWhere('perm.resource = :resource', { resource });
    }

    const search = query.search?.trim();
    if (search) {
      qb.andWhere(
        '(perm.code LIKE :term OR perm.description LIKE :term OR perm.resource LIKE :term OR perm.action LIKE :term)',
        { term: `%${search}%` },
      );
    }

    qb.orderBy('perm.resource', 'ASC')
      .addOrderBy('perm.action', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [permissions, total] = await qb.getManyAndCount();

    return {
      data: permissions.map(toPermissionDto),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOneDto(id: string): Promise<PermissionDto> {
    const permission = await this.findOne(id);
    return toPermissionDto(permission);
  }
}
