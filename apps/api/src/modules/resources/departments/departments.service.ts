import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { OrgScopeService } from '../../../common/org-scope/org-scope.service';
import { CrudService } from '../../../common/crud/crud.service';
import { Departments, Organizations } from '../../../entities/generated';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { PermissionsService } from '../../rbac/permissions.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { DepartmentsListQueryDto } from './dto/departments-list-query.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService extends CrudService<Departments> {
  constructor(
    @InjectRepository(Departments)
    private readonly departmentsRepository: Repository<Departments>,
    @InjectRepository(Organizations)
    private readonly organizationsRepository: Repository<Organizations>,
    private readonly orgScopeService: OrgScopeService,
    private readonly permissionsService: PermissionsService,
  ) {
    super(departmentsRepository);
  }

  async list(
    query: DepartmentsListQueryDto,
    user: AuthUserDto,
  ): Promise<PaginatedResult<Departments>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.departmentsRepository
      .createQueryBuilder('department')
      .where('department.deletedAt IS NULL');

    const isSuperAdmin = await this.permissionsService.hasSuperAdminRole(user.id);
    if (!isSuperAdmin) {
      const organizationId = await this.orgScopeService.resolveOrganizationId(
        user,
        query.organizationId,
      );
      qb.andWhere('department.organizationId = :organizationId', { organizationId });
    } else if (query.organizationId?.trim()) {
      qb.andWhere('department.organizationId = :organizationId', {
        organizationId: query.organizationId.trim(),
      });
    }

    const search = query.search?.trim();
    if (search) {
      qb.andWhere('department.name LIKE :term', { term: `%${search}%` });
    }

    qb.orderBy('department.name', 'ASC')
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

  async findOneForUser(id: string, user: AuthUserDto): Promise<Departments> {
    const department = await this.departmentsRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!department) {
      throw new NotFoundException(`Resource ${id} not found`);
    }

    const isSuperAdmin = await this.permissionsService.hasSuperAdminRole(user.id);
    if (!isSuperAdmin) {
      const organizationId = await this.orgScopeService.resolveOrganizationId(user);
      this.orgScopeService.assertRowBelongsToOrg(
        department.organizationId,
        organizationId,
      );
    }

    return department;
  }

  async createFromDto(
    dto: CreateDepartmentDto,
    user: AuthUserDto,
  ): Promise<Departments> {
    const organizationId = await this.orgScopeService.resolveOrganizationId(
      user,
      dto.organizationId,
    );
    await this.requireOrganization(organizationId);

    const name = dto.name.trim();
    await this.assertNameAvailable(organizationId, name);

    return super.create(
      {
        organizationId,
        name,
        description: dto.description?.trim() || null,
      },
      user.id,
    );
  }

  async updateFromDto(
    id: string,
    dto: UpdateDepartmentDto,
    user: AuthUserDto,
  ): Promise<Departments> {
    const existing = await this.findOneForUser(id, user);

    const name =
      dto.name !== undefined ? dto.name.trim() : existing.name;
    if (!name) {
      throw new ConflictException('Le nom du département est obligatoire.');
    }

    if (name !== existing.name) {
      await this.assertNameAvailable(existing.organizationId, name, id);
    }

    const payload: Partial<Departments> = {};
    if (dto.name !== undefined) payload.name = name;
    if (dto.description !== undefined) {
      payload.description =
        dto.description === null ? null : dto.description.trim() || null;
    }

    return super.update(id, payload, user.id);
  }

  async removeForUser(id: string, user: AuthUserDto): Promise<void> {
    await this.findOneForUser(id, user);
    await super.remove(id, user.id);
  }

  private async requireOrganization(organizationId: string): Promise<Organizations> {
    const organization = await this.organizationsRepository.findOne({
      where: { id: organizationId, deletedAt: IsNull() },
    });
    if (!organization) {
      throw new NotFoundException(`Organisation ${organizationId} introuvable.`);
    }
    return organization;
  }

  private async assertNameAvailable(
    organizationId: string,
    name: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await this.departmentsRepository.findOne({
      where: {
        organizationId,
        name,
        deletedAt: IsNull(),
      },
    });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException(
        `Un département « ${name} » existe déjà pour cette organisation.`,
      );
    }
  }
}
