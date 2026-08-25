import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, IsNull, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { UserPaymentMethods } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { UserPaymentMethodsListQueryDto } from './dto/user-payment-methods-list-query.dto';

@Injectable()
export class UserPaymentMethodsService extends CrudService<UserPaymentMethods> {
  constructor(
    @InjectRepository(UserPaymentMethods)
    private readonly paymentMethodsRepository: Repository<UserPaymentMethods>,
  ) {
    super(paymentMethodsRepository);
  }

  override async findAll(
    query: UserPaymentMethodsListQueryDto,
  ): Promise<PaginatedResult<UserPaymentMethods>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: FindOptionsWhere<UserPaymentMethods> = { deletedAt: IsNull() };
    if (query.userId) {
      where.userId = query.userId;
    }

    const [data, total] = await this.paymentMethodsRepository.findAndCount({
      where,
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
