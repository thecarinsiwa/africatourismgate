import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { Donations } from '../../../entities/donation.entity';
import { CreateDonationDto } from './dto/create-donation.dto';
import { DonationsListQueryDto } from './dto/donations-list-query.dto';
import { UpdateDonationDto } from './dto/update-donation.dto';

@Injectable()
export class DonationsService extends CrudService<Donations> {
  constructor(
    @InjectRepository(Donations)
    private readonly donationsRepository: Repository<Donations>,
  ) {
    super(donationsRepository);
  }

  async createFromDto(dto: CreateDonationDto, actorUserId?: string): Promise<Donations> {
    const locale = dto.locale ?? 'fr';
    if (dto.isNavbarFeatured) {
      await this.clearNavbarFeatured(locale);
    }
    return super.create(
      {
        ...dto,
        locale,
        showOnWeb: dto.showOnWeb ?? true,
        showOnGap: dto.showOnGap ?? true,
        isNavbarFeatured: dto.isNavbarFeatured ?? false,
        status: dto.status ?? 'draft',
        sortOrder: dto.sortOrder ?? 0,
      } as DeepPartial<Donations>,
      actorUserId,
    );
  }

  async updateFromDto(
    id: string,
    dto: UpdateDonationDto,
    actorUserId?: string,
  ): Promise<Donations> {
    const existing = await this.findOne(id);
    const locale = dto.locale ?? existing.locale;
    if (dto.isNavbarFeatured) {
      await this.clearNavbarFeatured(locale, id);
    }
    return super.update(id, dto as DeepPartial<Donations>, actorUserId);
  }

  override async findAll(query: DonationsListQueryDto): Promise<PaginatedResult<Donations>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.donationsRepository
      .createQueryBuilder('donation')
      .where('donation.deletedAt IS NULL');

    const search = query.search?.trim();
    if (search) {
      qb.andWhere(
        '(donation.title LIKE :term OR donation.description LIKE :term OR donation.contextNote LIKE :term)',
        { term: `%${search}%` },
      );
    }

    if (query.locale) {
      qb.andWhere('donation.locale = :locale', { locale: query.locale });
    }

    if (query.status) {
      qb.andWhere('donation.status = :status', { status: query.status });
    }

    qb.orderBy('donation.sortOrder', 'ASC')
      .addOrderBy('donation.title', 'ASC')
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

  private async clearNavbarFeatured(locale: string, keepId?: string): Promise<void> {
    const qb = this.donationsRepository
      .createQueryBuilder()
      .update(Donations)
      .set({ isNavbarFeatured: false })
      .where('locale = :locale', { locale })
      .andWhere('deletedAt IS NULL')
      .andWhere('isNavbarFeatured = :featured', { featured: true });

    if (keepId) {
      qb.andWhere('id != :keepId', { keepId });
    }

    await qb.execute();
  }
}
