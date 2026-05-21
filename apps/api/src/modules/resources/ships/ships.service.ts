import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CruiseLines, Ships } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { CreateShipDto } from './dto/create-ship.dto';
import { ShipsListQueryDto } from './dto/ships-list-query.dto';
import { UpdateShipDto } from './dto/update-ship.dto';

@Injectable()
export class ShipsService extends CrudService<Ships> {
  constructor(
    @InjectRepository(Ships)
    private readonly shipsRepository: Repository<Ships>,
    @InjectRepository(CruiseLines)
    private readonly cruiseLinesRepository: Repository<CruiseLines>,
  ) {
    super(shipsRepository);
  }

  override async findAll(query: ShipsListQueryDto): Promise<PaginatedResult<Ships>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const search = query.search?.trim();

    const qb = this.shipsRepository
      .createQueryBuilder('ship')
      .where('ship.deletedAt IS NULL');

    if (query.cruiseLineId) {
      qb.andWhere('ship.cruiseLineId = :cruiseLineId', {
        cruiseLineId: query.cruiseLineId,
      });
    }

    if (search) {
      const pattern = `%${search.toLowerCase()}%`;
      qb.andWhere('LOWER(ship.name) LIKE :pattern', { pattern });
    }

    qb.orderBy('ship.name', 'ASC')
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

  async createShip(dto: CreateShipDto, actorUserId?: string): Promise<Ships> {
    await this.assertCruiseLineExists(dto.cruiseLineId);
    return super.create(
      {
        cruiseLineId: dto.cruiseLineId,
        name: dto.name.trim(),
        builtYear: dto.builtYear ?? null,
      } as DeepPartial<Ships>,
      actorUserId,
    );
  }

  async updateShip(
    id: string,
    dto: UpdateShipDto,
    actorUserId?: string,
  ): Promise<Ships> {
    if (dto.cruiseLineId) {
      await this.assertCruiseLineExists(dto.cruiseLineId);
    }
    const payload = { ...dto } as UpdateShipDto;
    if (dto.name !== undefined) {
      payload.name = dto.name.trim();
    }
    return super.update(id, payload as DeepPartial<Ships>, actorUserId);
  }

  private async assertCruiseLineExists(cruiseLineId: string): Promise<void> {
    const line = await this.cruiseLinesRepository.findOne({
      where: { id: cruiseLineId },
    });
    if (!line) {
      throw new NotFoundException('Ligne de croisière introuvable.');
    }
  }
}
