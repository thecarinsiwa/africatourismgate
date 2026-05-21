import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CruisePorts } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { CreateCruisePortDto } from './dto/create-cruise-port.dto';
import { CruisePortsListQueryDto } from './dto/cruise-ports-list-query.dto';
import { UpdateCruisePortDto } from './dto/update-cruise-port.dto';

@Injectable()
export class CruisePortsService extends CrudService<CruisePorts> {
  constructor(
    @InjectRepository(CruisePorts)
    private readonly cruisePortsRepository: Repository<CruisePorts>,
  ) {
    super(cruisePortsRepository);
  }

  override async findAll(
    query: CruisePortsListQueryDto,
  ): Promise<PaginatedResult<CruisePorts>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const search = query.search?.trim();

    const qb = this.cruisePortsRepository
      .createQueryBuilder('port')
      .where('port.deletedAt IS NULL');

    if (search) {
      const pattern = `%${search.toLowerCase()}%`;
      qb.andWhere(
        new Brackets((sub) => {
          sub
            .where('LOWER(port.code) LIKE :pattern', { pattern })
            .orWhere('LOWER(port.name) LIKE :pattern', { pattern });
        }),
      );
    }

    qb.orderBy('port.name', 'ASC')
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

  async createCruisePort(
    dto: CreateCruisePortDto,
    actorUserId?: string,
  ): Promise<CruisePorts> {
    const code = dto.code.trim().toUpperCase();
    await this.assertCodeAvailable(code);
    return super.create(
      {
        code,
        name: dto.name.trim(),
        countryCode: dto.countryCode.trim().toUpperCase(),
      } as DeepPartial<CruisePorts>,
      actorUserId,
    );
  }

  async updateCruisePort(
    id: string,
    dto: UpdateCruisePortDto,
    actorUserId?: string,
  ): Promise<CruisePorts> {
    const payload = { ...dto } as UpdateCruisePortDto;
    if (dto.code !== undefined) {
      payload.code = dto.code.trim().toUpperCase();
      await this.assertCodeAvailable(payload.code, id);
    }
    if (dto.name !== undefined) {
      payload.name = dto.name.trim();
    }
    if (dto.countryCode !== undefined) {
      payload.countryCode = dto.countryCode.trim().toUpperCase();
    }
    return super.update(id, payload as DeepPartial<CruisePorts>, actorUserId);
  }

  private async assertCodeAvailable(code: string, excludeId?: string): Promise<void> {
    const existing = await this.cruisePortsRepository.findOne({ where: { code } });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException('Ce code port est déjà utilisé.');
    }
  }
}
