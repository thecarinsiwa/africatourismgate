import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { GapSiteSettings } from '../../../entities/gap-site-settings.entity';
import { CreateGapSiteSettingsDto } from './dto/create-gap-site-settings.dto';
import { GapSiteSettingsListQueryDto } from './dto/gap-site-settings-list-query.dto';
import { UpdateGapSiteSettingsDto } from './dto/update-gap-site-settings.dto';

@Injectable()
export class GapSiteSettingsService extends CrudService<GapSiteSettings> {
  constructor(
    @InjectRepository(GapSiteSettings)
    private readonly settingsRepository: Repository<GapSiteSettings>,
  ) {
    super(settingsRepository);
  }

  createFromDto(
    dto: CreateGapSiteSettingsDto,
    actorUserId?: string,
  ): Promise<GapSiteSettings> {
    return super.create(dto as DeepPartial<GapSiteSettings>, actorUserId);
  }

  updateFromDto(
    id: string,
    dto: UpdateGapSiteSettingsDto,
    actorUserId?: string,
  ): Promise<GapSiteSettings> {
    return super.update(id, dto as DeepPartial<GapSiteSettings>, actorUserId);
  }

  override async findAll(
    query: GapSiteSettingsListQueryDto,
  ): Promise<PaginatedResult<GapSiteSettings>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.settingsRepository
      .createQueryBuilder('settings')
      .where('settings.deletedAt IS NULL');

    if (query.locale) {
      qb.andWhere('settings.locale = :locale', { locale: query.locale });
    }

    if (query.status) {
      qb.andWhere('settings.status = :status', { status: query.status });
    }

    qb.orderBy('settings.locale', 'ASC').skip((page - 1) * limit).take(limit);

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
}
