import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { Airlines } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { AirlinesListQueryDto } from './dto/airlines-list-query.dto';
import { CreateAirlineDto } from './dto/create-airline.dto';
import { UpdateAirlineDto } from './dto/update-airline.dto';

@Injectable()
export class AirlinesService extends CrudService<Airlines> {
  constructor(
    @InjectRepository(Airlines)
    private readonly airlinesRepository: Repository<Airlines>,
  ) {
    super(airlinesRepository);
  }

  override async findAll(
    query: AirlinesListQueryDto,
  ): Promise<PaginatedResult<Airlines>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const search = query.search?.trim();

    const qb = this.airlinesRepository
      .createQueryBuilder('airline')
      .where('airline.deletedAt IS NULL');

    if (search) {
      const pattern = `%${search.toLowerCase()}%`;
      qb.andWhere(
        new Brackets((sub) => {
          sub
            .where('LOWER(airline.iataCode) LIKE :pattern', { pattern })
            .orWhere('LOWER(airline.name) LIKE :pattern', { pattern });
        }),
      );
    }

    qb.orderBy('airline.name', 'ASC')
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

  async createAirline(dto: CreateAirlineDto, actorUserId?: string): Promise<Airlines> {
    const iataCode = dto.iataCode.trim().toUpperCase();
    await this.assertIataAvailable(iataCode);
    return super.create(
      { iataCode, name: dto.name.trim() } as DeepPartial<Airlines>,
      actorUserId,
    );
  }

  async updateAirline(
    id: string,
    dto: UpdateAirlineDto,
    actorUserId?: string,
  ): Promise<Airlines> {
    const payload = { ...dto } as UpdateAirlineDto;
    if (dto.iataCode !== undefined) {
      payload.iataCode = dto.iataCode.trim().toUpperCase();
      await this.assertIataAvailable(payload.iataCode, id);
    }
    if (dto.name !== undefined) {
      payload.name = dto.name.trim();
    }
    return super.update(id, payload as DeepPartial<Airlines>, actorUserId);
  }

  private async assertIataAvailable(iataCode: string, excludeId?: string): Promise<void> {
    const existing = await this.airlinesRepository.findOne({ where: { iataCode } });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException('Ce code IATA est déjà utilisé par une autre compagnie.');
    }
  }
}
