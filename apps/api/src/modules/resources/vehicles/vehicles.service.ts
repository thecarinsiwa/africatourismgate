import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import {
  RentalAgencies,
  VehicleCategories,
  Vehicles,
} from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehiclesListQueryDto } from './dto/vehicles-list-query.dto';

@Injectable()
export class VehiclesService extends CrudService<Vehicles> {
  constructor(
    @InjectRepository(Vehicles)
    private readonly vehiclesRepository: Repository<Vehicles>,
    @InjectRepository(RentalAgencies)
    private readonly agenciesRepository: Repository<RentalAgencies>,
    @InjectRepository(VehicleCategories)
    private readonly categoriesRepository: Repository<VehicleCategories>,
  ) {
    super(vehiclesRepository);
  }

  override async findAll(
    query: VehiclesListQueryDto,
  ): Promise<PaginatedResult<Vehicles>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const search = query.search?.trim();

    const qb = this.vehiclesRepository
      .createQueryBuilder('vehicle')
      .where('vehicle.deletedAt IS NULL');

    if (search) {
      const pattern = `%${search.toUpperCase()}%`;
      qb.andWhere('UPPER(vehicle.licensePlate) LIKE :pattern', { pattern });
    }

    if (query.agencyId) {
      qb.andWhere('vehicle.agencyId = :agencyId', { agencyId: query.agencyId });
    }

    if (query.categoryId) {
      qb.andWhere('vehicle.categoryId = :categoryId', {
        categoryId: query.categoryId,
      });
    }

    qb.orderBy('vehicle.createdAt', 'DESC')
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

  async createVehicle(dto: CreateVehicleDto, actorUserId?: string): Promise<Vehicles> {
    await this.assertAgencyExists(dto.agencyId);
    await this.assertCategoryExists(dto.categoryId);

    return super.create(
      {
        agencyId: dto.agencyId,
        categoryId: dto.categoryId,
        dailyPriceCents: dto.dailyPriceCents,
        currency: dto.currency.trim().toUpperCase(),
        ...(dto.licensePlate?.trim()
          ? { licensePlate: dto.licensePlate.trim().toUpperCase() }
          : {}),
      } as DeepPartial<Vehicles>,
      actorUserId,
    );
  }

  async updateVehicle(
    id: string,
    dto: UpdateVehicleDto,
    actorUserId?: string,
  ): Promise<Vehicles> {
    if (dto.agencyId) await this.assertAgencyExists(dto.agencyId);
    if (dto.categoryId) await this.assertCategoryExists(dto.categoryId);

    const payload: DeepPartial<Vehicles> = { ...dto };
    if (dto.currency !== undefined) {
      payload.currency = dto.currency.trim().toUpperCase();
    }
    if (dto.licensePlate !== undefined) {
      (payload as { licensePlate?: string | null }).licensePlate =
        dto.licensePlate?.trim().toUpperCase() || null;
    }
    return super.update(id, payload, actorUserId);
  }

  private async assertAgencyExists(agencyId: string): Promise<void> {
    const row = await this.agenciesRepository.findOne({ where: { id: agencyId } });
    if (!row) {
      throw new NotFoundException('Agence de location introuvable.');
    }
  }

  private async assertCategoryExists(categoryId: string): Promise<void> {
    const row = await this.categoriesRepository.findOne({ where: { id: categoryId } });
    if (!row) {
      throw new NotFoundException('Catégorie de véhicule introuvable.');
    }
  }
}
