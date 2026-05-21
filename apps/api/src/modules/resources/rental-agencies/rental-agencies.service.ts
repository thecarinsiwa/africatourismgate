import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { Destinations, RentalAgencies } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { CreateRentalAgencyDto } from './dto/create-rental-agency.dto';
import { RentalAgenciesListQueryDto } from './dto/rental-agencies-list-query.dto';
import { UpdateRentalAgencyDto } from './dto/update-rental-agency.dto';

@Injectable()
export class RentalAgenciesService extends CrudService<RentalAgencies> {
  constructor(
    @InjectRepository(RentalAgencies)
    private readonly agenciesRepository: Repository<RentalAgencies>,
    @InjectRepository(Destinations)
    private readonly destinationsRepository: Repository<Destinations>,
  ) {
    super(agenciesRepository);
  }

  override async findAll(
    query: RentalAgenciesListQueryDto,
  ): Promise<PaginatedResult<RentalAgencies>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const search = query.search?.trim();

    const qb = this.agenciesRepository
      .createQueryBuilder('agency')
      .where('agency.deletedAt IS NULL');

    if (search) {
      const pattern = `%${search.toLowerCase()}%`;
      qb.andWhere(
        new Brackets((sub) => {
          sub
            .where('LOWER(agency.name) LIKE :pattern', { pattern })
            .orWhere('LOWER(agency.address) LIKE :pattern', { pattern });
        }),
      );
    }

    if (query.destinationId) {
      qb.andWhere('agency.destinationId = :destinationId', {
        destinationId: query.destinationId,
      });
    }

    qb.orderBy('agency.name', 'ASC')
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

  async createAgency(
    dto: CreateRentalAgencyDto,
    actorUserId?: string,
  ): Promise<RentalAgencies> {
    if (dto.destinationId) {
      await this.assertDestinationExists(dto.destinationId);
    }
    return super.create(
      {
        name: dto.name.trim(),
        destinationId: dto.destinationId ?? null,
        ...(dto.address?.trim() ? { address: dto.address.trim() } : {}),
      } as DeepPartial<RentalAgencies>,
      actorUserId,
    );
  }

  async updateAgency(
    id: string,
    dto: UpdateRentalAgencyDto,
    actorUserId?: string,
  ): Promise<RentalAgencies> {
    if (dto.destinationId) {
      await this.assertDestinationExists(dto.destinationId);
    }
    const payload: DeepPartial<RentalAgencies> = {};
    if (dto.name !== undefined) payload.name = dto.name.trim();
    if (dto.destinationId !== undefined) {
      (payload as { destinationId?: string | null }).destinationId = dto.destinationId;
    }
    if (dto.address !== undefined) {
      (payload as { address?: string | null }).address = dto.address?.trim() || null;
    }
    return super.update(id, payload, actorUserId);
  }

  private async assertDestinationExists(destinationId: string): Promise<void> {
    const row = await this.destinationsRepository.findOne({
      where: { id: destinationId },
    });
    if (!row) {
      throw new NotFoundException('Destination introuvable.');
    }
  }
}
