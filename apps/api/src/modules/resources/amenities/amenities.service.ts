import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { Amenities } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { CreateAmenityDto } from './dto/create-amenity.dto';
import { AmenitiesListQueryDto } from './dto/amenities-list-query.dto';
import { UpdateAmenityDto } from './dto/update-amenity.dto';

@Injectable()
export class AmenitiesService extends CrudService<Amenities> {
  constructor(
    @InjectRepository(Amenities)
    private readonly amenitiesRepository: Repository<Amenities>,
  ) {
    super(amenitiesRepository);
  }

  override async findAll(
    query: AmenitiesListQueryDto,
  ): Promise<PaginatedResult<Amenities>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const search = query.search?.trim();

    const qb = this.amenitiesRepository
      .createQueryBuilder('amenity')
      .where('amenity.deletedAt IS NULL');

    if (search) {
      const pattern = `%${search.toLowerCase()}%`;
      qb.andWhere(
        new Brackets((sub) => {
          sub
            .where('LOWER(amenity.code) LIKE :pattern', { pattern })
            .orWhere('LOWER(amenity.name) LIKE :pattern', { pattern });
        }),
      );
    }

    qb.orderBy('amenity.name', 'ASC')
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

  async createAmenity(dto: CreateAmenityDto, actorUserId?: string): Promise<Amenities> {
    const code = dto.code.trim().toLowerCase();
    await this.assertCodeAvailable(code);
    return super.create({ ...dto, code } as DeepPartial<Amenities>, actorUserId);
  }

  async updateAmenity(
    id: string,
    dto: UpdateAmenityDto,
    actorUserId?: string,
  ): Promise<Amenities> {
    const payload = { ...dto } as UpdateAmenityDto;
    if (dto.code !== undefined) {
      payload.code = dto.code.trim().toLowerCase();
      await this.assertCodeAvailable(payload.code, id);
    }
    return super.update(id, payload as DeepPartial<Amenities>, actorUserId);
  }

  private async assertCodeAvailable(code: string, excludeId?: string): Promise<void> {
    const existing = await this.amenitiesRepository.findOne({
      where: { code },
    });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException('Ce code est déjà utilisé par un autre équipement.');
    }
  }
}
