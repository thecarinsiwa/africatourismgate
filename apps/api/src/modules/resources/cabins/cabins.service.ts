import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { Cabins, Ships } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { CreateCabinDto } from './dto/create-cabin.dto';
import { CabinsListQueryDto } from './dto/cabins-list-query.dto';
import { UpdateCabinDto } from './dto/update-cabin.dto';

@Injectable()
export class CabinsService extends CrudService<Cabins> {
  constructor(
    @InjectRepository(Cabins)
    private readonly cabinsRepository: Repository<Cabins>,
    @InjectRepository(Ships)
    private readonly shipsRepository: Repository<Ships>,
  ) {
    super(cabinsRepository);
  }

  override async findAll(query: CabinsListQueryDto): Promise<PaginatedResult<Cabins>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.cabinsRepository
      .createQueryBuilder('cabin')
      .where('cabin.deletedAt IS NULL');

    if (query.shipId) {
      qb.andWhere('cabin.shipId = :shipId', { shipId: query.shipId });
    }

    qb.orderBy('cabin.categoryName', 'ASC')
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

  async createCabin(dto: CreateCabinDto, actorUserId?: string): Promise<Cabins> {
    await this.assertShipExists(dto.shipId);
    return super.create(
      {
        shipId: dto.shipId,
        categoryName: dto.categoryName.trim(),
        maxGuests: dto.maxGuests,
        basePriceCents: dto.basePriceCents,
        currency: dto.currency.trim().toUpperCase(),
      } as DeepPartial<Cabins>,
      actorUserId,
    );
  }

  async updateCabin(
    id: string,
    dto: UpdateCabinDto,
    actorUserId?: string,
  ): Promise<Cabins> {
    const payload = { ...dto } as UpdateCabinDto;
    if (dto.categoryName !== undefined) {
      payload.categoryName = dto.categoryName.trim();
    }
    if (dto.currency !== undefined) {
      payload.currency = dto.currency.trim().toUpperCase();
    }
    return super.update(id, payload as DeepPartial<Cabins>, actorUserId);
  }

  private async assertShipExists(shipId: string): Promise<void> {
    const ship = await this.shipsRepository.findOne({ where: { id: shipId } });
    if (!ship) {
      throw new NotFoundException('Navire introuvable.');
    }
  }
}
