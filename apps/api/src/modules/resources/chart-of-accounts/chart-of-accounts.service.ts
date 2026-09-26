import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { ChartOfAccounts } from '../../../entities/chart-of-account.entity';
import { ChartAccountsListQueryDto } from './dto/chart-accounts-list-query.dto';
import {
  ChartAccountDto,
  toChartAccountDto,
} from './dto/chart-account.dto';

/**
 * Plan comptable SYSCOHADA (SYSCO-002) — lecture minimale.
 * Pas d’écritures (SYSCO-003).
 */
@Injectable()
export class ChartOfAccountsService {
  constructor(
    @InjectRepository(ChartOfAccounts)
    private readonly accountsRepo: Repository<ChartOfAccounts>,
  ) {}

  async findAll(
    query: ChartAccountsListQueryDto,
  ): Promise<PaginatedResult<ChartAccountDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;

    const qb = this.accountsRepo
      .createQueryBuilder('account')
      .where('account.deletedAt IS NULL');

    if (query.organizationId) {
      qb.andWhere('account.organizationId = :organizationId', {
        organizationId: query.organizationId,
      });
    }
    if (query.classNumber !== undefined) {
      qb.andWhere('account.classNumber = :classNumber', {
        classNumber: query.classNumber,
      });
    }
    if (query.accountType) {
      qb.andWhere('account.accountType = :accountType', {
        accountType: query.accountType,
      });
    }
    if (query.isActive !== undefined) {
      qb.andWhere('account.isActive = :isActive', {
        isActive: query.isActive,
      });
    }
    if (query.isPostable !== undefined) {
      qb.andWhere('account.isPostable = :isPostable', {
        isPostable: query.isPostable,
      });
    }
    if (query.search?.trim()) {
      const search = `%${query.search.trim()}%`;
      qb.andWhere(
        '(account.code LIKE :search OR account.label LIKE :search OR account.syscohadaRef LIKE :search)',
        { search },
      );
    }

    qb.orderBy('account.code', 'ASC');
    qb.skip((page - 1) * limit).take(limit);

    const [rows, total] = await qb.getManyAndCount();
    return {
      data: rows.map(toChartAccountDto),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async findOne(id: string): Promise<ChartAccountDto> {
    const row = await this.accountsRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!row) {
      throw new NotFoundException('Chart account not found');
    }
    return toChartAccountDto(row);
  }
}
