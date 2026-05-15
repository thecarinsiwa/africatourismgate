import { Injectable, NotFoundException } from '@nestjs/common';
import {
  DeepPartial,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
} from 'typeorm';
import {
  PaginatedResult,
  PaginationQueryDto,
} from '../dto/pagination-query.dto';
import { newId } from '../utils/uuid';

@Injectable()
export class CrudService<T extends ObjectLiteral & { id: string }> {
  constructor(private readonly repository: Repository<T>) {}

  async findAll(query: PaginationQueryDto): Promise<PaginatedResult<T>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const [data, total] = await this.repository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' } as never,
    });
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

  async findOne(id: string): Promise<T> {
    const row = await this.repository.findOne({
      where: { id } as FindOptionsWhere<T>,
    });
    if (!row) {
      throw new NotFoundException(`Resource ${id} not found`);
    }
    return row;
  }

  async create(dto: DeepPartial<T>, actorUserId?: string): Promise<T> {
    const entity = this.repository.create({
      ...dto,
      id: (dto as { id?: string }).id ?? newId(),
      createdByUserId: actorUserId ?? null,
    } as DeepPartial<T>);
    return this.repository.save(entity);
  }

  async update(
    id: string,
    dto: DeepPartial<T>,
    actorUserId?: string,
  ): Promise<T> {
    const existing = await this.findOne(id);
    const merged = this.repository.merge(existing, {
      ...dto,
      updatedByUserId: actorUserId ?? null,
    } as DeepPartial<T>);
    return this.repository.save(merged);
  }

  async remove(id: string, actorUserId?: string): Promise<void> {
    await this.findOne(id);
    await this.repository.softDelete(id);
    if (actorUserId) {
      await this.repository.update(id, {
        deletedByUserId: actorUserId,
      } as never);
    }
  }
}
