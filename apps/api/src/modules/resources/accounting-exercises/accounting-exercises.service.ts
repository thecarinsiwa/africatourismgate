import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import {
  AccountingExercises,
  AccountingPeriods,
} from '../../../entities/accounting-exercise.entity';
import { AccountingExercisesListQueryDto } from './dto/accounting-exercises-list-query.dto';
import { AccountingPeriodsListQueryDto } from './dto/accounting-periods-list-query.dto';
import {
  AccountingExerciseDto,
  AccountingPeriodDto,
  toAccountingExerciseDto,
  toAccountingPeriodDto,
} from './dto/accounting-exercise.dto';

/**
 * Exercices / périodes comptables (SYSCO-002) — lecture minimale.
 */
@Injectable()
export class AccountingExercisesService {
  constructor(
    @InjectRepository(AccountingExercises)
    private readonly exercisesRepo: Repository<AccountingExercises>,
    @InjectRepository(AccountingPeriods)
    private readonly periodsRepo: Repository<AccountingPeriods>,
  ) {}

  async findAllExercises(
    query: AccountingExercisesListQueryDto,
  ): Promise<PaginatedResult<AccountingExerciseDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.exercisesRepo
      .createQueryBuilder('exercise')
      .where('exercise.deletedAt IS NULL');

    if (query.organizationId) {
      qb.andWhere('exercise.organizationId = :organizationId', {
        organizationId: query.organizationId,
      });
    }
    if (query.status) {
      qb.andWhere('exercise.status = :status', { status: query.status });
    }

    qb.orderBy('exercise.startsOn', 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [rows, total] = await qb.getManyAndCount();

    let periodsByExercise = new Map<string, AccountingPeriodDto[]>();
    if (query.includePeriods && rows.length > 0) {
      periodsByExercise = await this.loadPeriodsByExerciseIds(
        rows.map((r) => r.id),
      );
    }

    return {
      data: rows.map((row) =>
        toAccountingExerciseDto(row, periodsByExercise.get(row.id)),
      ),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async findOneExercise(id: string): Promise<AccountingExerciseDto> {
    const row = await this.exercisesRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!row) {
      throw new NotFoundException('Accounting exercise not found');
    }
    const periods = await this.periodsRepo.find({
      where: { exerciseId: id, deletedAt: IsNull() },
      order: { sequenceNo: 'ASC' },
    });
    return toAccountingExerciseDto(row, periods.map(toAccountingPeriodDto));
  }

  async findAllPeriods(
    query: AccountingPeriodsListQueryDto,
  ): Promise<PaginatedResult<AccountingPeriodDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;

    const qb = this.periodsRepo
      .createQueryBuilder('period')
      .where('period.deletedAt IS NULL');

    if (query.organizationId) {
      qb.andWhere('period.organizationId = :organizationId', {
        organizationId: query.organizationId,
      });
    }
    if (query.exerciseId) {
      qb.andWhere('period.exerciseId = :exerciseId', {
        exerciseId: query.exerciseId,
      });
    }
    if (query.status) {
      qb.andWhere('period.status = :status', { status: query.status });
    }

    qb.orderBy('period.sequenceNo', 'ASC');
    qb.skip((page - 1) * limit).take(limit);

    const [rows, total] = await qb.getManyAndCount();
    return {
      data: rows.map(toAccountingPeriodDto),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async findOnePeriod(id: string): Promise<AccountingPeriodDto> {
    const row = await this.periodsRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!row) {
      throw new NotFoundException('Accounting period not found');
    }
    return toAccountingPeriodDto(row);
  }

  private async loadPeriodsByExerciseIds(
    exerciseIds: string[],
  ): Promise<Map<string, AccountingPeriodDto[]>> {
    const rows = await this.periodsRepo.find({
      where: { exerciseId: In(exerciseIds), deletedAt: IsNull() },
      order: { sequenceNo: 'ASC' },
    });
    const map = new Map<string, AccountingPeriodDto[]>();
    for (const row of rows) {
      const list = map.get(row.exerciseId) ?? [];
      list.push(toAccountingPeriodDto(row));
      map.set(row.exerciseId, list);
    }
    return map;
  }
}
