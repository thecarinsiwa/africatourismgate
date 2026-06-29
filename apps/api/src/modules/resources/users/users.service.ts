import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { OrgScopeService } from '../../../common/org-scope/org-scope.service';
import { CrudService } from '../../../common/crud/crud.service';
import { Users } from '../../../entities/generated';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { UsersListQueryDto } from './dto/users-list-query.dto';

@Injectable()
export class UsersService extends CrudService<Users> {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    private readonly orgScopeService: OrgScopeService,
  ) {
    super(usersRepository);
  }

  async list(
    query: UsersListQueryDto,
    user: AuthUserDto,
  ): Promise<PaginatedResult<Users>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.usersRepository
      .createQueryBuilder('user')
      .where('user.deletedAt IS NULL');

    if (query.status) {
      qb.andWhere('user.status = :status', { status: query.status });
    }

    if (query.organizationId) {
      const organizationId = await this.orgScopeService.resolveOrganizationId(
        user,
        query.organizationId,
      );
      qb.andWhere('user.organizationId = :organizationId', { organizationId });
    }

    if (query.roleId) {
      qb.innerJoin(
        'user_role_assignments',
        'ura',
        'ura.user_id = user.id AND ura.role_id = :roleId AND ura.revoked_at IS NULL AND ura.deleted_at IS NULL',
        { roleId: query.roleId },
      );
    }

    const search = query.search?.trim();
    if (search) {
      const term = `%${search}%`;
      qb.andWhere(
        '(user.email LIKE :term OR user.firstName LIKE :term OR user.lastName LIKE :term)',
        { term },
      );
    }

    qb.orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

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
}
