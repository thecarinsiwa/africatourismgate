import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { SupportTickets } from '../../../entities/generated';
import { SupportTicketsListQueryDto } from './dto/support-tickets-list-query.dto';

@Injectable()
export class SupportTicketsService extends CrudService<SupportTickets> {
  constructor(
    @InjectRepository(SupportTickets)
    private readonly supportTicketsRepository: Repository<SupportTickets>,
  ) {
    super(supportTicketsRepository);
  }

  override async findAll(
    query: SupportTicketsListQueryDto,
  ): Promise<PaginatedResult<SupportTickets>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const [data, total] = await this.supportTicketsRepository.findAndCount({
      where: {
        deletedAt: IsNull(),
        ...(query.status ? { status: query.status } : {}),
        ...(query.priority ? { priority: query.priority } : {}),
      },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

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
