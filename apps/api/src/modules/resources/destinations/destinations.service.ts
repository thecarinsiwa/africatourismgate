import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { Destinations } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { CreateDestinationDto } from './dto/create-destination.dto';
import { DestinationsListQueryDto } from './dto/destinations-list-query.dto';
import { UpdateDestinationDto } from './dto/update-destination.dto';

@Injectable()
export class DestinationsService extends CrudService<Destinations> {
  constructor(
    @InjectRepository(Destinations)
    private readonly destinationsRepository: Repository<Destinations>,
  ) {
    super(destinationsRepository);
  }

  override async findAll(
    query: DestinationsListQueryDto,
  ): Promise<PaginatedResult<Destinations>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const search = query.search?.trim();

    const qb = this.destinationsRepository
      .createQueryBuilder('dest')
      .where('dest.deletedAt IS NULL');

    if (search) {
      const pattern = `%${search.toLowerCase()}%`;
      qb.andWhere(
        new Brackets((sub) => {
          sub
            .where('LOWER(dest.name) LIKE :pattern', { pattern })
            .orWhere('LOWER(dest.slug) LIKE :pattern', { pattern })
            .orWhere('LOWER(dest.countryCode) LIKE :pattern', { pattern });
        }),
      );
    }

    qb.orderBy('dest.createdAt', 'DESC')
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

  override async create(
    dto: CreateDestinationDto,
    actorUserId?: string,
  ): Promise<Destinations> {
    const slug = dto.slug.trim().toLowerCase();
    const countryCode = dto.countryCode.trim().toUpperCase();
    await this.assertSlugAvailable(slug);
    return super.create(
      {
        ...dto,
        slug,
        countryCode,
      } as DeepPartial<Destinations>,
      actorUserId,
    );
  }

  override async update(
    id: string,
    dto: UpdateDestinationDto,
    actorUserId?: string,
  ): Promise<Destinations> {
    const payload = { ...dto } as UpdateDestinationDto;
    if (dto.slug !== undefined) {
      payload.slug = dto.slug.trim().toLowerCase();
      await this.assertSlugAvailable(payload.slug, id);
    }
    if (dto.countryCode !== undefined) {
      payload.countryCode = dto.countryCode.trim().toUpperCase();
    }
    return super.update(id, payload as DeepPartial<Destinations>, actorUserId);
  }

  private async assertSlugAvailable(slug: string, excludeId?: string): Promise<void> {
    const existing = await this.destinationsRepository.findOne({
      where: { slug },
    });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException('Ce slug est déjà utilisé par une autre destination.');
    }
  }
}
