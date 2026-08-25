import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, IsNull, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { UserAddresses } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { UserAddressesListQueryDto } from './dto/user-addresses-list-query.dto';

@Injectable()
export class UserAddressesService extends CrudService<UserAddresses> {
  constructor(
    @InjectRepository(UserAddresses)
    private readonly addressesRepository: Repository<UserAddresses>,
  ) {
    super(addressesRepository);
  }

  override async findAll(
    query: UserAddressesListQueryDto,
  ): Promise<PaginatedResult<UserAddresses>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: FindOptionsWhere<UserAddresses> = { deletedAt: IsNull() };
    if (query.userId) {
      where.userId = query.userId;
    }

    const [data, total] = await this.addressesRepository.findAndCount({
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
