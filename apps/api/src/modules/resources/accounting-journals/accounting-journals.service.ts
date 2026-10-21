import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { AccountingJournals } from '../../../entities/accounting-journal.entity';
import {
  AccountingJournalDto,
  toAccountingJournalDto,
} from './dto/accounting-journal.dto';
import { AccountingJournalsListQueryDto } from './dto/accounting-journals-list-query.dto';

@Injectable()
export class AccountingJournalsService {
  constructor(
    @InjectRepository(AccountingJournals)
    private readonly journalsRepo: Repository<AccountingJournals>,
  ) {}

  async findAll(
    query: AccountingJournalsListQueryDto,
  ): Promise<PaginatedResult<AccountingJournalDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;

    const qb = this.journalsRepo
      .createQueryBuilder('journal')
      .where('journal.deletedAt IS NULL');

    if (query.organizationId) {
      qb.andWhere('journal.organizationId = :organizationId', {
        organizationId: query.organizationId,
      });
    }
    if (query.journalType) {
      qb.andWhere('journal.journalType = :journalType', {
        journalType: query.journalType,
      });
    }
    if (query.isActive !== undefined) {
      qb.andWhere('journal.isActive = :isActive', { isActive: query.isActive });
    }

    qb.orderBy('journal.code', 'ASC');
    qb.skip((page - 1) * limit).take(limit);

    const [rows, total] = await qb.getManyAndCount();
    return {
      data: rows.map(toAccountingJournalDto),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async findOne(id: string): Promise<AccountingJournalDto> {
    const row = await this.journalsRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!row) {
      throw new NotFoundException('Accounting journal not found');
    }
    return toAccountingJournalDto(row);
  }
}
