import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { Organizations } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { OrgScopeService } from '../../../common/org-scope/org-scope.service';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { PermissionsService } from '../../rbac/permissions.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { OrganizationsListQueryDto } from './dto/organizations-list-query.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationsService extends CrudService<Organizations> {
  constructor(
    @InjectRepository(Organizations)
    private readonly orgRepository: Repository<Organizations>,
    private readonly orgScope: OrgScopeService,
    private readonly permissionsService: PermissionsService,
  ) {
    super(orgRepository);
  }

  override async findAll(
    query: OrganizationsListQueryDto,
  ): Promise<PaginatedResult<Organizations>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const search = query.search?.trim();

    const qb = this.orgRepository
      .createQueryBuilder('org')
      .where('org.deletedAt IS NULL');

    if (search) {
      const pattern = `%${search.toLowerCase()}%`;
      qb.andWhere(
        new Brackets((sub) => {
          sub
            .where('LOWER(org.name) LIKE :pattern', { pattern })
            .orWhere('LOWER(org.slug) LIKE :pattern', { pattern });
        }),
      );
    }

    qb.orderBy('org.createdAt', 'DESC')
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

  override async create(
    dto: CreateOrganizationDto,
    actorUserId?: string,
  ): Promise<Organizations> {
    const slug = dto.slug.trim().toLowerCase();
    await this.assertSlugAvailable(slug);
    return super.create(
      {
        ...dto,
        slug,
        status: dto.status ?? 'active',
      } as DeepPartial<Organizations>,
      actorUserId,
    );
  }

  override async update(
    id: string,
    dto: UpdateOrganizationDto,
    userOrActorId?: AuthUserDto | string,
  ): Promise<Organizations> {
    const existing = await this.orgRepository.findOne({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Organisation introuvable.');
    }

    const actorUserId =
      typeof userOrActorId === 'string'
        ? userOrActorId
        : userOrActorId?.id;

    if (userOrActorId && typeof userOrActorId !== 'string') {
      const isSuperAdmin = await this.permissionsService.hasSuperAdminRole(
        userOrActorId.id,
      );
      if (!isSuperAdmin) {
        await this.orgScope.assertCanAccessOrganization(userOrActorId, id);
        const restricted: UpdateOrganizationDto = { ...dto };
        delete restricted.slug;
        delete restricted.status;
        return this.applyUpdate(id, restricted, actorUserId);
      }
    }

    return this.applyUpdate(id, dto, actorUserId);
  }

  private async applyUpdate(
    id: string,
    dto: UpdateOrganizationDto,
    actorUserId: string | undefined,
  ): Promise<Organizations> {
    const payload = { ...dto } as UpdateOrganizationDto;
    if (dto.slug !== undefined) {
      payload.slug = dto.slug.trim().toLowerCase();
      await this.assertSlugAvailable(payload.slug, id);
    }
    if (dto.currency !== undefined) {
      payload.currency = dto.currency.trim().toUpperCase();
    }
    return super.update(id, payload as DeepPartial<Organizations>, actorUserId);
  }

  private async assertSlugAvailable(slug: string, excludeId?: string): Promise<void> {
    const normalized = slug.trim().toLowerCase();
    const existing = await this.orgRepository.findOne({
      where: { slug: normalized },
    });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException('Ce slug est déjà utilisé par une autre organisation.');
    }
  }
}
