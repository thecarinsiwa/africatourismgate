import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { OrgScopeService } from '../../../common/org-scope/org-scope.service';
import { CrudService } from '../../../common/crud/crud.service';
import { Employees, Organizations, Users } from '../../../entities/generated';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { EmployeeDto, toEmployeeDto } from './dto/employee.dto';
import { EmployeesListQueryDto } from './dto/employees-list-query.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import {
  formatEmployeeCode,
  organizationPrefixFromSlug,
} from './employee-code.util';
import { assertHireDateBeforeTermination } from './employee-dates.util';

const USER_ALREADY_EMPLOYEE_MESSAGE =
  'Cet utilisateur possède déjà un profil employé.';

@Injectable()
export class EmployeesService extends CrudService<Employees> {
  constructor(
    @InjectRepository(Employees)
    private readonly employeesRepository: Repository<Employees>,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    @InjectRepository(Organizations)
    private readonly organizationsRepository: Repository<Organizations>,
    private readonly orgScopeService: OrgScopeService,
  ) {
    super(employeesRepository);
  }

  async list(
    query: EmployeesListQueryDto,
    user: AuthUserDto,
  ): Promise<PaginatedResult<EmployeeDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.employeesRepository
      .createQueryBuilder('employee')
      .where('employee.deletedAt IS NULL');

    if (query.status) {
      qb.andWhere('employee.status = :status', { status: query.status });
    }

    if (query.organizationId) {
      const organizationId = await this.orgScopeService.resolveOrganizationId(
        user,
        query.organizationId,
      );
      qb.andWhere('employee.organizationId = :organizationId', { organizationId });
    }

    const search = query.search?.trim();
    if (search) {
      const term = `%${search}%`;
      qb.leftJoin(
        Users,
        'user',
        'user.id = employee.userId AND user.deletedAt IS NULL',
      );
      qb.andWhere(
        '(employee.employeeCode LIKE :term OR employee.jobTitle LIKE :term OR user.email LIKE :term OR user.firstName LIKE :term OR user.lastName LIKE :term)',
        { term },
      );
    }

    qb.orderBy('employee.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [employees, total] = await qb.getManyAndCount();

    const userIds = [...new Set(employees.map((employee) => employee.userId))];
    const users =
      userIds.length > 0
        ? await this.usersRepository.find({
            where: { id: In(userIds), deletedAt: IsNull() },
          })
        : [];
    const userById = new Map(users.map((row) => [row.id, row]));

    return {
      data: employees.map((employee) =>
        toEmployeeDto(employee, userById.get(employee.userId)),
      ),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async createFromDto(
    dto: CreateEmployeeDto,
    actorUserId?: string,
  ): Promise<EmployeeDto> {
    await this.requireUser(dto.userId);
    await this.assertUserAvailableForEmployee(dto.userId);

    const organizationId = dto.organizationId?.trim() || null;
    if (organizationId) {
      await this.requireOrganization(organizationId);
    }

    assertHireDateBeforeTermination(dto.hireDate, dto.terminationDate);

    const employeeCode =
      dto.employeeCode?.trim() ||
      (await this.generateEmployeeCode(organizationId));

    const employee = await super.create(
      {
        userId: dto.userId,
        organizationId,
        employeeCode,
        jobTitle: dto.jobTitle?.trim() || null,
        department: dto.department?.trim() || null,
        hireDate: dto.hireDate?.trim() || null,
        terminationDate: dto.terminationDate?.trim() || null,
        salary:
          dto.salary !== undefined && dto.salary !== null
            ? String(dto.salary)
            : null,
        currency: dto.currency?.trim().toUpperCase() || null,
        managerId: dto.managerId?.trim() || null,
        status: dto.status ?? 'active',
      },
      actorUserId,
    );

    const user = await this.usersRepository.findOne({
      where: { id: dto.userId, deletedAt: IsNull() },
    });
    return toEmployeeDto(employee, user);
  }

  async findOneDto(id: string): Promise<EmployeeDto> {
    const employee = await this.employeesRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!employee) {
      throw new NotFoundException(`Resource ${id} not found`);
    }

    const user = await this.usersRepository.findOne({
      where: { id: employee.userId, deletedAt: IsNull() },
    });
    return toEmployeeDto(employee, user);
  }

  async updateFromDto(
    id: string,
    dto: UpdateEmployeeDto,
    actorUserId?: string,
  ): Promise<EmployeeDto> {
    const existing = await this.employeesRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!existing) {
      throw new NotFoundException(`Resource ${id} not found`);
    }

    if (dto.userId !== undefined && dto.userId !== existing.userId) {
      await this.requireUser(dto.userId);
      await this.assertUserAvailableForEmployee(dto.userId, id);
    }

    if (dto.organizationId !== undefined && dto.organizationId !== null) {
      await this.requireOrganization(dto.organizationId);
    }

    const hireDate =
      dto.hireDate !== undefined ? dto.hireDate : existing.hireDate;
    const terminationDate =
      dto.terminationDate !== undefined
        ? dto.terminationDate
        : existing.terminationDate;
    assertHireDateBeforeTermination(hireDate, terminationDate);

    const payload: Partial<Employees> = {};

    if (dto.userId !== undefined) payload.userId = dto.userId;
    if (dto.organizationId !== undefined) {
      payload.organizationId = dto.organizationId;
    }
    if (dto.employeeCode !== undefined) {
      payload.employeeCode = dto.employeeCode?.trim() || null;
    }
    if (dto.jobTitle !== undefined) {
      payload.jobTitle = dto.jobTitle?.trim() || null;
    }
    if (dto.department !== undefined) {
      payload.department = dto.department?.trim() || null;
    }
    if (dto.hireDate !== undefined) payload.hireDate = dto.hireDate || null;
    if (dto.terminationDate !== undefined) {
      payload.terminationDate = dto.terminationDate || null;
    }
    if (dto.salary !== undefined) {
      payload.salary =
        dto.salary === null ? null : String(dto.salary);
    }
    if (dto.currency !== undefined) {
      payload.currency = dto.currency?.trim().toUpperCase() || null;
    }
    if (dto.managerId !== undefined) {
      payload.managerId = dto.managerId || null;
    }
    if (dto.status !== undefined) payload.status = dto.status;

    const updated = await super.update(id, payload, actorUserId);
    const user = await this.usersRepository.findOne({
      where: { id: updated.userId, deletedAt: IsNull() },
    });
    return toEmployeeDto(updated, user);
  }

  private async assertUserAvailableForEmployee(
    userId: string,
    excludeEmployeeId?: string,
  ): Promise<void> {
    const existing = await this.employeesRepository.findOne({
      where: { userId, deletedAt: IsNull() },
    });
    if (existing && existing.id !== excludeEmployeeId) {
      throw new ConflictException(USER_ALREADY_EMPLOYEE_MESSAGE);
    }
  }

  private async requireUser(userId: string): Promise<Users> {
    const user = await this.usersRepository.findOne({
      where: { id: userId, deletedAt: IsNull() },
    });
    if (!user) {
      throw new NotFoundException(`Utilisateur ${userId} introuvable.`);
    }
    return user;
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

  private async generateEmployeeCode(organizationId: string | null): Promise<string> {
    let prefix = organizationPrefixFromSlug(null);
    if (organizationId) {
      const organization = await this.organizationsRepository.findOne({
        where: { id: organizationId, deletedAt: IsNull() },
      });
      if (organization) {
        prefix = organizationPrefixFromSlug(organization.slug);
      }
    }

    const qb = this.employeesRepository
      .createQueryBuilder('employee')
      .where('employee.deletedAt IS NULL');
    if (organizationId) {
      qb.andWhere('employee.organizationId = :organizationId', { organizationId });
    } else {
      qb.andWhere('employee.organizationId IS NULL');
    }

    const count = await qb.getCount();
    return formatEmployeeCode(prefix, count + 1);
  }
}
