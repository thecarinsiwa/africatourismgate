import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { Employees, Organizations, Users } from '../../../entities/generated';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { EmployeeDto, toEmployeeDto } from './dto/employee.dto';
import { EmployeesListQueryDto } from './dto/employees-list-query.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import {
  formatEmployeeCode,
  organizationPrefixFromSlug,
} from './employee-code.util';

@Injectable()
export class EmployeesService {
  private readonly crud: CrudService<Employees>;

  constructor(
    @InjectRepository(Employees)
    private readonly employeesRepository: Repository<Employees>,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    @InjectRepository(Organizations)
    private readonly organizationsRepository: Repository<Organizations>,
  ) {
    this.crud = new CrudService(employeesRepository);
  }

  async findAll(
    query: EmployeesListQueryDto,
  ): Promise<PaginatedResult<EmployeeDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const search = query.search?.trim();

    const qb = this.employeesRepository
      .createQueryBuilder('emp')
      .leftJoin(Users, 'user', 'user.id = emp.userId')
      .where('emp.deletedAt IS NULL');

    if (query.organizationId) {
      qb.andWhere('emp.organizationId = :organizationId', {
        organizationId: query.organizationId,
      });
    }

    if (query.status) {
      qb.andWhere('emp.status = :status', { status: query.status });
    }

    if (search) {
      const pattern = `%${search.toLowerCase()}%`;
      qb.andWhere(
        new Brackets((sub) => {
          sub
            .where('LOWER(emp.employeeCode) LIKE :pattern', { pattern })
            .orWhere('LOWER(emp.jobTitle) LIKE :pattern', { pattern })
            .orWhere('LOWER(emp.department) LIKE :pattern', { pattern })
            .orWhere('LOWER(user.email) LIKE :pattern', { pattern })
            .orWhere('LOWER(user.firstName) LIKE :pattern', { pattern })
            .orWhere('LOWER(user.lastName) LIKE :pattern', { pattern });
        }),
      );
    }

    qb.orderBy('emp.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [rows, total] = await qb.getManyAndCount();
    const userIds = [...new Set(rows.map((r) => r.userId))];
    const usersById = await this.loadUsersByIds(userIds);

    return {
      data: rows.map((row) =>
        toEmployeeDto(row, usersById.get(row.userId) ?? null),
      ),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(id: string): Promise<EmployeeDto> {
    const employee = await this.getActiveEmployee(id);
    const user = await this.usersRepository.findOne({
      where: { id: employee.userId },
    });
    return toEmployeeDto(employee, user);
  }

  async create(dto: CreateEmployeeDto, actorUserId?: string): Promise<EmployeeDto> {
    await this.assertUserAvailable(dto.userId);
    if (dto.organizationId) {
      await this.assertOrganizationExists(dto.organizationId);
    }
    if (dto.managerId) {
      await this.assertManagerExists(dto.managerId);
    }

    const payload = this.buildCreatePayload(dto);
    if (!dto.employeeCode?.trim()) {
      payload.employeeCode = (await this.generateEmployeeCode(
        dto.organizationId ?? null,
      )) as DeepPartial<Employees>['employeeCode'];
    }

    const employee = await this.crud.create(payload, actorUserId);
    const user = await this.usersRepository.findOne({
      where: { id: employee.userId },
    });
    return toEmployeeDto(employee, user);
  }

  async update(
    id: string,
    dto: UpdateEmployeeDto,
    actorUserId?: string,
  ): Promise<EmployeeDto> {
    await this.getActiveEmployee(id);

    if (dto.userId !== undefined) {
      await this.assertUserAvailable(dto.userId, id);
    }
    if (dto.organizationId !== undefined && dto.organizationId !== null) {
      await this.assertOrganizationExists(dto.organizationId);
    }
    if (dto.managerId !== undefined && dto.managerId !== null) {
      if (dto.managerId === id) {
        throw new ConflictException('Un employé ne peut pas être son propre manager.');
      }
      await this.assertManagerExists(dto.managerId);
    }

    const employee = await this.crud.update(
      id,
      this.buildUpdatePayload(dto),
      actorUserId,
    );
    const user = await this.usersRepository.findOne({
      where: { id: employee.userId },
    });
    return toEmployeeDto(employee, user);
  }

  async remove(id: string, actorUserId?: string): Promise<void> {
    await this.crud.remove(id, actorUserId);
  }

  private buildCreatePayload(dto: CreateEmployeeDto): DeepPartial<Employees> {
    return {
      userId: dto.userId,
      organizationId: (dto.organizationId ?? null) as DeepPartial<Employees>['organizationId'],
      employeeCode: (dto.employeeCode?.trim() ?? null) as DeepPartial<Employees>['employeeCode'],
      jobTitle: (dto.jobTitle?.trim() ?? null) as DeepPartial<Employees>['jobTitle'],
      department: (dto.department?.trim() ?? null) as DeepPartial<Employees>['department'],
      hireDate: (dto.hireDate ?? null) as DeepPartial<Employees>['hireDate'],
      terminationDate: (dto.terminationDate ?? null) as DeepPartial<Employees>['terminationDate'],
      salary: (dto.salary != null ? String(dto.salary) : null) as DeepPartial<Employees>['salary'],
      currency: (dto.currency?.trim().toUpperCase() ?? 'USD') as DeepPartial<Employees>['currency'],
      managerId: (dto.managerId ?? null) as DeepPartial<Employees>['managerId'],
      status: dto.status ?? 'active',
    };
  }

  private buildUpdatePayload(dto: UpdateEmployeeDto): DeepPartial<Employees> {
    const payload: DeepPartial<Employees> = {};

    if (dto.userId !== undefined) payload.userId = dto.userId;
    if (dto.organizationId !== undefined) {
      payload.organizationId = dto.organizationId as DeepPartial<Employees>['organizationId'];
    }
    if (dto.employeeCode !== undefined) {
      payload.employeeCode = (dto.employeeCode?.trim() ?? null) as DeepPartial<Employees>['employeeCode'];
    }
    if (dto.jobTitle !== undefined) {
      payload.jobTitle = (dto.jobTitle?.trim() ?? null) as DeepPartial<Employees>['jobTitle'];
    }
    if (dto.department !== undefined) {
      payload.department = (dto.department?.trim() ?? null) as DeepPartial<Employees>['department'];
    }
    if (dto.hireDate !== undefined) {
      payload.hireDate = dto.hireDate as DeepPartial<Employees>['hireDate'];
    }
    if (dto.terminationDate !== undefined) {
      payload.terminationDate = dto.terminationDate as DeepPartial<Employees>['terminationDate'];
    }
    if (dto.salary !== undefined) {
      payload.salary = (dto.salary != null ? String(dto.salary) : null) as DeepPartial<Employees>['salary'];
    }
    if (dto.currency !== undefined) {
      payload.currency = (dto.currency?.trim().toUpperCase() ?? null) as DeepPartial<Employees>['currency'];
    }
    if (dto.managerId !== undefined) {
      payload.managerId = dto.managerId as DeepPartial<Employees>['managerId'];
    }
    if (dto.status !== undefined) payload.status = dto.status;

    return payload;
  }

  private async getActiveEmployee(id: string): Promise<Employees> {
    const employee = await this.employeesRepository.findOne({ where: { id } });
    if (!employee || employee.deletedAt) {
      throw new NotFoundException(`Resource ${id} not found`);
    }
    return employee;
  }

  private async loadUsersByIds(
    userIds: string[],
  ): Promise<Map<string, Users>> {
    const map = new Map<string, Users>();
    if (userIds.length === 0) return map;

    const users = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.id IN (:...userIds)', { userIds })
      .andWhere('user.deletedAt IS NULL')
      .getMany();

    for (const user of users) {
      map.set(user.id, user);
    }
    return map;
  }

  private async assertUserAvailable(
    userId: string,
    excludeEmployeeId?: string,
  ): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user || user.deletedAt) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    const existing = await this.employeesRepository
      .createQueryBuilder('emp')
      .where('emp.userId = :userId', { userId })
      .andWhere('emp.deletedAt IS NULL')
      .getOne();

    if (existing && existing.id !== excludeEmployeeId) {
      throw new ConflictException(
        'Cet utilisateur possède déjà un profil employé.',
      );
    }
  }

  private async assertOrganizationExists(organizationId: string): Promise<void> {
    const org = await this.organizationsRepository.findOne({
      where: { id: organizationId },
    });
    if (!org || org.deletedAt) {
      throw new NotFoundException('Organisation introuvable.');
    }
  }

  private async assertManagerExists(managerId: string): Promise<void> {
    const manager = await this.employeesRepository.findOne({
      where: { id: managerId },
    });
    if (!manager || manager.deletedAt) {
      throw new NotFoundException('Manager (employé) introuvable.');
    }
  }

  private async resolveOrganizationPrefix(
    organizationId: string | null,
  ): Promise<string> {
    if (!organizationId) return organizationPrefixFromSlug(null);
    const org = await this.organizationsRepository.findOne({
      where: { id: organizationId },
    });
    return organizationPrefixFromSlug(org?.slug);
  }

  private async nextEmployeeSequence(organizationId: string | null): Promise<number> {
    const qb = this.employeesRepository
      .createQueryBuilder('emp')
      .where('emp.deletedAt IS NULL');

    if (organizationId) {
      qb.andWhere('emp.organizationId = :organizationId', { organizationId });
    } else {
      qb.andWhere('emp.organizationId IS NULL');
    }

    return (await qb.getCount()) + 1;
  }

  private async generateEmployeeCode(
    organizationId: string | null,
  ): Promise<string> {
    const prefix = await this.resolveOrganizationPrefix(organizationId);
    let sequence = await this.nextEmployeeSequence(organizationId);

    for (let attempt = 0; attempt < 100; attempt++) {
      const code = formatEmployeeCode(prefix, sequence);
      const existing = await this.employeesRepository
        .createQueryBuilder('emp')
        .where('emp.employeeCode = :code', { code })
        .andWhere('emp.deletedAt IS NULL')
        .getOne();

      if (!existing) return code;
      sequence++;
    }

    throw new ConflictException(
      'Impossible de générer un code employé unique.',
    );
  }
}
