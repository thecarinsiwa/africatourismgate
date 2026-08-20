import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { OrgScopeService } from '../../../common/org-scope/org-scope.service';
import { CrudService } from '../../../common/crud/crud.service';
import { Roles, UserRoleAssignments, Users } from '../../../entities/generated';
import { BCRYPT_ROUNDS } from '../../auth/auth.constants';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { EmailService } from '../../email/email.service';
import { resolvePdfLocale } from '../../email/booking-detail-pdf.labels';
import { UsersListQueryDto } from './dto/users-list-query.dto';

type UserWriteDto = DeepPartial<Users> & { password?: string };

@Injectable()
export class UsersService extends CrudService<Users> {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    @InjectRepository(UserRoleAssignments)
    private readonly roleAssignmentsRepository: Repository<UserRoleAssignments>,
    private readonly orgScopeService: OrgScopeService,
    private readonly emailService: EmailService,
    private readonly config: ConfigService,
  ) {
    super(usersRepository);
  }

  override async create(
    dto: UserWriteDto,
    actorUserId?: string,
  ): Promise<Users> {
    const normalized = await this.normalizeWriteDto(dto);
    return super.create(normalized, actorUserId);
  }

  override async update(
    id: string,
    dto: UserWriteDto,
    actorUserId?: string,
  ): Promise<Users> {
    const existing = await this.findOne(id);
    const shouldNotifyActivation =
      existing.status === 'suspended' && dto.status === 'active';

    const normalized = await this.normalizeWriteDto(dto);
    const saved = await super.update(id, normalized, actorUserId);

    if (shouldNotifyActivation && saved.status === 'active') {
      await this.notifyAccountActivated(saved);
    }

    return saved;
  }

  private async normalizeWriteDto(
    dto: UserWriteDto,
  ): Promise<DeepPartial<Users>> {
    const { password, email, ...rest } = dto;
    const normalized: DeepPartial<Users> = { ...rest };

    if (typeof email === 'string') {
      normalized.email = email.trim().toLowerCase();
    }

    if (typeof password === 'string' && password.length > 0) {
      normalized.passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    }

    return normalized;
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

    if (query.withoutRole) {
      qb.leftJoin(
        'user_role_assignments',
        'ura_none',
        'ura_none.user_id = user.id AND ura_none.revoked_at IS NULL AND ura_none.deleted_at IS NULL',
      ).andWhere('ura_none.id IS NULL');
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

  private async listActiveRoleNames(userId: string): Promise<string[]> {
    const rows = await this.roleAssignmentsRepository
      .createQueryBuilder('ura')
      .innerJoin(Roles, 'role', 'role.id = ura.roleId')
      .select('role.name', 'name')
      .where('ura.userId = :userId', { userId })
      .andWhere('ura.deletedAt IS NULL')
      .andWhere('ura.revokedAt IS NULL')
      .andWhere('(ura.expiresAt IS NULL OR ura.expiresAt > :now)', {
        now: new Date(),
      })
      .andWhere('role.deletedAt IS NULL')
      .orderBy('role.name', 'ASC')
      .getRawMany<{ name: string }>();

    return rows.map((row) => row.name).filter((name) => Boolean(name?.trim()));
  }

  private async notifyAccountActivated(user: Users): Promise<void> {
    try {
      const adminUrl =
        this.config.get<string>('NEXT_PUBLIC_ADMIN_URL')?.replace(/\/$/, '') ||
        (process.env.NODE_ENV === 'production'
          ? 'https://app-africatourismgate.org'
          : 'http://localhost:3001');
      const roles = await this.listActiveRoleNames(user.id);
      const result = await this.emailService.sendAdminAccountActivated({
        to: user.email,
        firstName: user.firstName,
        loginUrl: `${adminUrl}/login`,
        locale: resolvePdfLocale(user.preferredLanguage),
        roles,
      });
      if (!result.sent) {
        this.logger.warn(
          `Account activation email was not sent to ${user.email} (check EMAIL_TRANSPORT / SMTP)`,
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `Account activation email failed for ${user.email}: ${message}`,
      );
    }
  }
}
