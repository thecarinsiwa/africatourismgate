import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { PromoCodes } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { PromoCodesListQueryDto } from './dto/promo-codes-list-query.dto';

@Injectable()
export class PromoCodesService extends CrudService<PromoCodes> {
  constructor(
    @InjectRepository(PromoCodes)
    private readonly promoCodesRepository: Repository<PromoCodes>,
  ) {
    super(promoCodesRepository);
  }

  async list(query: PromoCodesListQueryDto): Promise<PaginatedResult<PromoCodes>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.promoCodesRepository
      .createQueryBuilder('promoCode')
      .where('promoCode.deletedAt IS NULL');

    const search = query.search?.trim();
    if (search) {
      qb.andWhere('promoCode.code LIKE :term', { term: `%${search}%` });
    }

    qb.orderBy('promoCode.createdAt', 'DESC')
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
}
