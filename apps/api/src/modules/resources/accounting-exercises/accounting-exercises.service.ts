import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { newId } from '../../../common/utils/uuid';
import {
  AccountingExercises,
  AccountingPeriods,
} from '../../../entities/accounting-exercise.entity';
import { AccountingJournals } from '../../../entities/accounting-journal.entity';
import { ChartOfAccounts } from '../../../entities/chart-of-account.entity';
import { JournalEntries } from '../../../entities/journal-entry.entity';
import { Organizations } from '../../../entities/generated/organizations.entity';
import { AccountingAuditService } from '../accounting-audit/accounting-audit.service';
import { JournalEntriesService } from '../journal-entries/journal-entries.service';
import { CreateAccountingExerciseDto } from './dto/create-accounting-exercise.dto';
import { UpdateAccountingExerciseDto } from './dto/update-accounting-exercise.dto';
import { AccountingExercisesListQueryDto } from './dto/accounting-exercises-list-query.dto';
import { AccountingPeriodsListQueryDto } from './dto/accounting-periods-list-query.dto';
import {
  AccountingExerciseDto,
  AccountingPeriodDto,
  toAccountingExerciseDto,
  toAccountingPeriodDto,
} from './dto/accounting-exercise.dto';
import { buildMonthlyPeriods } from './monthly-periods.util';

function dateOnly(value: string | Date): string {
  if (typeof value === 'string') return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}

/**
 * Exercices / périodes comptables (SYSCO-002 lecture + create/patch + SYSCO-008 clôture).
 */
@Injectable()
export class AccountingExercisesService {
  constructor(
    @InjectRepository(AccountingExercises)
    private readonly exercisesRepo: Repository<AccountingExercises>,
    @InjectRepository(AccountingPeriods)
    private readonly periodsRepo: Repository<AccountingPeriods>,
    @InjectRepository(AccountingJournals)
    private readonly journalsRepo: Repository<AccountingJournals>,
    @InjectRepository(ChartOfAccounts)
    private readonly accountsRepo: Repository<ChartOfAccounts>,
    @InjectRepository(Organizations)
    private readonly organizationsRepo: Repository<Organizations>,
    @InjectRepository(JournalEntries)
    private readonly journalEntriesRepo: Repository<JournalEntries>,
    private readonly journalEntries: JournalEntriesService,
    private readonly accountingAudit: AccountingAuditService,
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

  async createFromDto(
    dto: CreateAccountingExerciseDto,
    actorUserId?: string | null,
  ): Promise<AccountingExerciseDto> {
    const org = await this.organizationsRepo.findOne({
      where: { id: dto.organizationId },
    });
    if (!org || org.status === 'deleted') {
      throw new NotFoundException('Organization not found');
    }

    const startsOn = dateOnly(dto.startsOn);
    const endsOn = dateOnly(dto.endsOn);
    if (startsOn > endsOn) {
      throw new BadRequestException('startsOn must be on or before endsOn');
    }

    const code = dto.code.trim();
    const label = dto.label.trim();
    if (!code || !label) {
      throw new BadRequestException('code and label are required');
    }

    const currency = (
      dto.currency?.trim() ||
      org.currency?.trim() ||
      'XOF'
    ).toUpperCase();
    if (!/^[A-Z]{3}$/.test(currency)) {
      throw new BadRequestException('currency must be a 3-letter ISO code');
    }

    await this.assertUniqueCode(dto.organizationId, code);

    let periodSpecs;
    try {
      periodSpecs = buildMonthlyPeriods(startsOn, endsOn);
    } catch {
      throw new BadRequestException('Invalid startsOn / endsOn range');
    }
    if (periodSpecs.length === 0) {
      throw new BadRequestException('Exercise date range produced no periods');
    }

    const exerciseId = newId();
    try {
      const exercise = this.exercisesRepo.create({
        id: exerciseId,
        organizationId: dto.organizationId,
        code,
        label,
        startsOn,
        endsOn,
        currency,
        status: 'open',
        closedAt: null,
        closedByUserId: null,
        createdByUserId: actorUserId ?? null,
      });
      await this.exercisesRepo.save(exercise);

      const periods = periodSpecs.map((spec) =>
        this.periodsRepo.create({
          id: newId(),
          exerciseId,
          organizationId: dto.organizationId,
          code: spec.code,
          startsOn: spec.startsOn,
          endsOn: spec.endsOn,
          status: 'open',
          sequenceNo: spec.sequenceNo,
          createdByUserId: actorUserId ?? null,
        }),
      );
      await this.periodsRepo.save(periods);

      await this.accountingAudit.log({
        organizationId: dto.organizationId,
        entityType: 'exercise',
        entityId: exerciseId,
        action: 'create',
        actorId: actorUserId ?? null,
        newJson: {
          code,
          label,
          startsOn,
          endsOn,
          currency,
          periodCount: periods.length,
        },
      });

      return toAccountingExerciseDto(
        exercise,
        periods.map(toAccountingPeriodDto),
      );
    } catch (error) {
      this.rethrowDuplicateCode(error);
      throw error;
    }
  }

  async updateFromDto(
    id: string,
    dto: UpdateAccountingExerciseDto,
    actorUserId?: string | null,
  ): Promise<AccountingExerciseDto> {
    const exercise = await this.requireExercise(id);
    const oldJson = {
      label: exercise.label,
      currency: exercise.currency,
      status: exercise.status,
    };

    if (dto.label !== undefined) {
      const label = dto.label.trim();
      if (!label) {
        throw new BadRequestException('label cannot be empty');
      }
      exercise.label = label;
    }

    if (dto.currency !== undefined) {
      const currency = dto.currency.trim().toUpperCase();
      if (!/^[A-Z]{3}$/.test(currency)) {
        throw new BadRequestException('currency must be a 3-letter ISO code');
      }
      if (currency !== exercise.currency) {
        if (exercise.status !== 'open') {
          throw new ConflictException(
            'Currency can only be changed while the exercise is open',
          );
        }
        const postedCount = await this.journalEntriesRepo.count({
          where: {
            exerciseId: id,
            status: 'posted',
            deletedAt: IsNull(),
          },
        });
        if (postedCount > 0) {
          throw new ConflictException(
            'Currency cannot be changed after posted journal entries exist for this exercise',
          );
        }
        exercise.currency = currency;
      }
    }

    exercise.updatedByUserId = actorUserId ?? null;
    await this.exercisesRepo.save(exercise);

    await this.accountingAudit.log({
      organizationId: exercise.organizationId,
      entityType: 'exercise',
      entityId: exercise.id,
      action: 'update',
      actorId: actorUserId ?? null,
      oldJson,
      newJson: {
        label: exercise.label,
        currency: exercise.currency,
        status: exercise.status,
      },
    });

    return this.findOneExercise(id);
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

  async lockPeriod(
    id: string,
    actorUserId?: string | null,
  ): Promise<AccountingPeriodDto> {
    const period = await this.requirePeriod(id);
    if (period.status === 'closed') {
      throw new BadRequestException('Cannot lock a closed period');
    }
    const oldJson = { status: period.status };
    period.status = 'locked';
    period.updatedByUserId = actorUserId ?? null;
    await this.periodsRepo.save(period);
    await this.accountingAudit.log({
      organizationId: period.organizationId,
      entityType: 'period',
      entityId: period.id,
      action: 'lock',
      actorId: actorUserId ?? null,
      oldJson,
      newJson: { status: period.status },
    });
    return toAccountingPeriodDto(period);
  }

  async unlockPeriod(
    id: string,
    actorUserId?: string | null,
  ): Promise<AccountingPeriodDto> {
    const period = await this.requirePeriod(id);
    if (period.status === 'closed') {
      throw new BadRequestException('Cannot unlock a closed period');
    }
    const exercise = await this.exercisesRepo.findOne({
      where: { id: period.exerciseId, deletedAt: IsNull() },
    });
    if (exercise?.status === 'closed') {
      throw new BadRequestException('Cannot unlock a period of a closed exercise');
    }
    const oldJson = { status: period.status };
    period.status = 'open';
    period.updatedByUserId = actorUserId ?? null;
    await this.periodsRepo.save(period);
    await this.accountingAudit.log({
      organizationId: period.organizationId,
      entityType: 'period',
      entityId: period.id,
      action: 'unlock',
      actorId: actorUserId ?? null,
      oldJson,
      newJson: { status: period.status },
    });
    return toAccountingPeriodDto(period);
  }

  /**
   * Clôture d’exercice MVP : verrouille les périodes ouvertes, génère OD de
   * clôture charges/produits → compte 13, marque l’exercice `closed`.
   */
  async closeExercise(
    id: string,
    actorUserId?: string | null,
  ): Promise<{
    exercise: AccountingExerciseDto;
    closingJournalEntryId: string | null;
    openingJournalEntryId: string | null;
  }> {
    const exercise = await this.exercisesRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!exercise) {
      throw new NotFoundException('Accounting exercise not found');
    }
    if (exercise.status === 'closed') {
      throw new BadRequestException('Exercise is already closed');
    }

    const draftCount = await this.journalEntries.countDraftEntries(id);
    if (draftCount > 0) {
      throw new BadRequestException(
        `Cannot close exercise while ${draftCount} draft journal entr${draftCount === 1 ? 'y' : 'ies'} remain`,
      );
    }

    const periods = await this.periodsRepo.find({
      where: { exerciseId: id, deletedAt: IsNull() },
      order: { sequenceNo: 'ASC' },
    });
    const lastPeriod = periods[periods.length - 1];
    if (!lastPeriod) {
      throw new BadRequestException('Exercise has no periods');
    }
    if (lastPeriod.status === 'locked' || lastPeriod.status === 'closed') {
      throw new BadRequestException(
        'Last period must be open to post the closing entry — unlock it first',
      );
    }

    const statusBeforeClose = exercise.status;
    exercise.status = 'closing';
    exercise.updatedByUserId = actorUserId ?? null;
    await this.exercisesRepo.save(exercise);

    const balance = await this.journalEntries.getBalance({
      organizationId: exercise.organizationId,
      exerciseId: exercise.id,
    });

    const resultAccount = await this.accountsRepo.findOne({
      where: {
        organizationId: exercise.organizationId,
        code: '13',
        deletedAt: IsNull(),
      },
    });
    if (!resultAccount) {
      throw new BadRequestException(
        'Result account code 13 is required to close the exercise',
      );
    }

    const odJournal = await this.journalsRepo.findOne({
      where: {
        organizationId: exercise.organizationId,
        code: 'OD',
        deletedAt: IsNull(),
      },
    });
    if (!odJournal) {
      throw new BadRequestException('OD journal is required to close the exercise');
    }

    type LineInput = {
      accountId: string;
      label: string;
      debitCents: number;
      creditCents: number;
    };
    const lines: LineInput[] = [];
    let resultDebit = 0;
    let resultCredit = 0;

    for (const row of balance.rows) {
      if (row.classNumber === 6 && row.balanceCents > 0) {
        const amount = row.balanceCents;
        lines.push({
          accountId: row.accountId,
          label: `Clôture ${row.accountCode}`,
          debitCents: 0,
          creditCents: amount,
        });
        resultDebit += amount;
      }
      if (row.classNumber === 7 && row.balanceCents < 0) {
        const amount = -row.balanceCents;
        lines.push({
          accountId: row.accountId,
          label: `Clôture ${row.accountCode}`,
          debitCents: amount,
          creditCents: 0,
        });
        resultCredit += amount;
      }
    }

    if (resultDebit > 0) {
      lines.push({
        accountId: resultAccount.id,
        label: 'Clôture charges → résultat',
        debitCents: resultDebit,
        creditCents: 0,
      });
    }
    if (resultCredit > 0) {
      lines.push({
        accountId: resultAccount.id,
        label: 'Clôture produits → résultat',
        debitCents: 0,
        creditCents: resultCredit,
      });
    }

    const netResultCents = resultCredit - resultDebit;
    let closingJournalEntryId: string | null = null;
    if (lines.length >= 2) {
      const entry = await this.journalEntries.create(
        {
          organizationId: exercise.organizationId,
          journalId: odJournal.id,
          entryDate: dateOnly(exercise.endsOn),
          description: `Clôture exercice ${exercise.code}`,
          status: 'posted',
          source: 'closing',
          exerciseId: exercise.id,
          periodId: lastPeriod.id,
          lines,
        },
        actorUserId,
      );
      closingJournalEntryId = entry.id;
    }

    for (const period of periods) {
      period.status = 'closed';
      period.updatedByUserId = actorUserId ?? null;
      await this.periodsRepo.save(period);
    }

    const openingJournalEntryId = await this.postReportANouveau(
      exercise,
      odJournal.id,
      actorUserId,
    );

    exercise.status = 'closed';
    exercise.closedAt = new Date();
    exercise.closedByUserId = actorUserId ?? null;
    exercise.updatedByUserId = actorUserId ?? null;
    await this.exercisesRepo.save(exercise);

    await this.accountingAudit.log({
      organizationId: exercise.organizationId,
      entityType: 'exercise',
      entityId: exercise.id,
      action: 'close',
      actorId: actorUserId ?? null,
      oldJson: { status: statusBeforeClose },
      newJson: {
        status: exercise.status,
        closingJournalEntryId,
        openingJournalEntryId,
        netResultCents,
      },
    });

    return {
      exercise: await this.findOneExercise(exercise.id),
      closingJournalEntryId,
      openingJournalEntryId,
    };
  }

  /**
   * Report à nouveau MVP : si un exercice suivant existe, poste une pièce
   * d’ouverture reportant les soldes classes 1–5 (après OD de clôture).
   */
  private async postReportANouveau(
    closedExercise: AccountingExercises,
    odJournalId: string,
    actorUserId?: string | null,
  ): Promise<string | null> {
    const nextExercise = await this.exercisesRepo
      .createQueryBuilder('ex')
      .where('ex.organizationId = :organizationId', {
        organizationId: closedExercise.organizationId,
      })
      .andWhere('ex.deletedAt IS NULL')
      .andWhere('ex.startsOn > :endsOn', {
        endsOn: dateOnly(closedExercise.endsOn),
      })
      .andWhere('ex.id != :id', { id: closedExercise.id })
      .orderBy('ex.startsOn', 'ASC')
      .getOne();
    if (!nextExercise || nextExercise.status === 'closed') {
      return null;
    }

    const nextPeriods = await this.periodsRepo.find({
      where: { exerciseId: nextExercise.id, deletedAt: IsNull() },
      order: { sequenceNo: 'ASC' },
    });
    const firstPeriod = nextPeriods[0];
    if (
      !firstPeriod ||
      firstPeriod.status === 'locked' ||
      firstPeriod.status === 'closed'
    ) {
      return null;
    }

    const balanceAfterClose = await this.journalEntries.getBalance({
      organizationId: closedExercise.organizationId,
      exerciseId: closedExercise.id,
    });
    const carryRows = balanceAfterClose.rows.filter(
      (r) => r.classNumber >= 1 && r.classNumber <= 5 && r.balanceCents !== 0,
    );
    if (carryRows.length < 2) {
      return null;
    }

    const lines = carryRows.map((row) => ({
      accountId: row.accountId,
      label: `RAN ${row.accountCode}`,
      debitCents: row.balanceCents > 0 ? row.balanceCents : 0,
      creditCents: row.balanceCents < 0 ? -row.balanceCents : 0,
    }));
    const debitSum = lines.reduce((s, l) => s + l.debitCents, 0);
    const creditSum = lines.reduce((s, l) => s + l.creditCents, 0);
    if (debitSum !== creditSum || debitSum === 0) {
      return null;
    }

    const entry = await this.journalEntries.create(
      {
        organizationId: closedExercise.organizationId,
        journalId: odJournalId,
        entryDate: dateOnly(nextExercise.startsOn),
        description: `Report à nouveau depuis ${closedExercise.code}`,
        status: 'posted',
        source: 'closing',
        exerciseId: nextExercise.id,
        periodId: firstPeriod.id,
        lines,
      },
      actorUserId,
    );
    return entry.id;
  }

  private async requireExercise(id: string): Promise<AccountingExercises> {
    const row = await this.exercisesRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!row) {
      throw new NotFoundException('Accounting exercise not found');
    }
    return row;
  }

  private async requirePeriod(id: string): Promise<AccountingPeriods> {
    const row = await this.periodsRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!row) {
      throw new NotFoundException('Accounting period not found');
    }
    return row;
  }

  private async assertUniqueCode(
    organizationId: string,
    code: string,
    excludeId?: string,
  ): Promise<void> {
    const qb = this.exercisesRepo
      .createQueryBuilder('exercise')
      .where('exercise.deletedAt IS NULL')
      .andWhere('exercise.organizationId = :organizationId', { organizationId })
      .andWhere('exercise.code = :code', { code });
    if (excludeId) {
      qb.andWhere('exercise.id != :excludeId', { excludeId });
    }
    const existing = await qb.getOne();
    if (existing) {
      throw new ConflictException(
        'An accounting exercise with this code already exists for the organization',
      );
    }
  }

  private rethrowDuplicateCode(error: unknown): void {
    if (
      typeof error === 'object' &&
      error !== null &&
      'driverError' in error &&
      (error.driverError as { code?: string })?.code === 'ER_DUP_ENTRY'
    ) {
      throw new ConflictException(
        'An accounting exercise with this code already exists for the organization',
      );
    }
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
