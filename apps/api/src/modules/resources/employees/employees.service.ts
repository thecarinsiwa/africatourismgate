import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { OrgScopeService } from '../../../common/org-scope/org-scope.service';
import { CrudService } from '../../../common/crud/crud.service';
import { Employees, Users } from '../../../entities/generated';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { EmployeeDto, toEmployeeDto } from './dto/employee.dto';
import { EmployeesListQueryDto } from './dto/employees-list-query.dto';

@Injectable()
export class EmployeesService extends CrudService<Employees> {
  constructor(
    @InjectRepository(Employees)
    private readonly employeesRepository: Repository<Employees>,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
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
}
