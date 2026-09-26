import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, In, Repository } from 'typeorm';
import { CrudService } from '../../../common/crud/crud.service';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { newId } from '../../../common/utils/uuid';
import {
  FundEntries,
  FundEntryBookings,
} from '../../../entities/fund-entry.entity';
import { CreateFundEntryDto } from './dto/create-fund-entry.dto';
import { FundEntriesListQueryDto } from './dto/fund-entries-list-query.dto';
import { UpdateFundEntryDto } from './dto/update-fund-entry.dto';

export type FundEntryResponse = FundEntries & { bookingIds: string[] };

@Injectable()
export class FundEntriesService extends CrudService<FundEntries> {
  constructor(
    @InjectRepository(FundEntries)
    private readonly fundEntriesRepository: Repository<FundEntries>,
    @InjectRepository(FundEntryBookings)
    private readonly fundEntryBookingsRepository: Repository<FundEntryBookings>,
  ) {
    super(fundEntriesRepository);
  }

  async createFromDto(
    dto: CreateFundEntryDto,
    actorUserId?: string,
  ): Promise<FundEntryResponse> {
    const { bookingIds, ...fields } = dto;
    const entry = await super.create(
      {
        ...fields,
        currency: fields.currency.toUpperCase(),
        status: 'recorded',
      } as DeepPartial<FundEntries>,
      actorUserId,
    );
    await this.syncBookingIds(entry.id, bookingIds ?? []);
    return this.toResponse(entry);
  }

  async updateFromDto(
    id: string,
    dto: UpdateFundEntryDto,
    actorUserId?: string,
  ): Promise<FundEntryResponse> {
    const existing = await this.findOne(id);
    if (existing.status === 'voided') {
      throw new BadRequestException('Cannot update a voided fund entry');
    }

    const { bookingIds, ...fields } = dto;
    const payload: DeepPartial<FundEntries> = { ...fields };
    if (fields.currency) {
      payload.currency = fields.currency.toUpperCase();
    }

    const entry = await super.update(id, payload, actorUserId);
    if (bookingIds !== undefined) {
      await this.syncBookingIds(id, bookingIds);
    }
    return this.toResponse(entry);
  }

  override async findOne(id: string): Promise<FundEntries> {
    return super.findOne(id);
  }

  async findOneDto(id: string): Promise<FundEntryResponse> {
    const entry = await this.findOne(id);
    return this.toResponse(entry);
  }

  override async findAll(
    query: FundEntriesListQueryDto,
  ): Promise<PaginatedResult<FundEntryResponse>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.fundEntriesRepository
      .createQueryBuilder('entry')
      .where('entry.deletedAt IS NULL');

    if (query.organizationId) {
      qb.andWhere('entry.organizationId = :organizationId', {
        organizationId: query.organizationId,
      });
    }

    if (query.dateFrom) {
      qb.andWhere('entry.operationDate >= :dateFrom', {
        dateFrom: query.dateFrom.slice(0, 10),
      });
    }

    if (query.dateTo) {
      qb.andWhere('entry.operationDate <= :dateTo', {
        dateTo: query.dateTo.slice(0, 10),
      });
    }

    if (query.currency) {
      qb.andWhere('entry.currency = :currency', {
        currency: query.currency.toUpperCase(),
      });
    }

    if (query.source) {
      qb.andWhere('entry.source = :source', { source: query.source });
    }

    if (query.paymentMethod) {
      qb.andWhere('entry.paymentMethod = :paymentMethod', {
        paymentMethod: query.paymentMethod,
      });
    }

    if (query.status) {
      qb.andWhere('entry.status = :status', { status: query.status });
    }

    if (query.bookingId) {
      qb.andWhere(
        `EXISTS (
          SELECT 1 FROM fund_entry_bookings feb
          WHERE feb.fund_entry_id = entry.id
            AND feb.booking_id = :bookingId
        )`,
        { bookingId: query.bookingId },
      );
    }

    const search = query.search?.trim();
    if (search) {
      qb.andWhere('(entry.reference LIKE :term OR entry.notes LIKE :term)', {
        term: `%${search}%`,
      });
    }

    qb.orderBy('entry.operationDate', 'DESC')
      .addOrderBy('entry.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    const withBookings = await this.attachBookingIds(data);

    return {
      data: withBookings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  override async remove(id: string, actorUserId?: string): Promise<void> {
    const existing = await this.findOne(id);
    if (existing.status === 'voided') {
      throw new BadRequestException('Cannot delete a voided fund entry');
    }
    return super.remove(id, actorUserId);
  }

  private async syncBookingIds(
    fundEntryId: string,
    bookingIds: string[],
  ): Promise<void> {
    const uniqueIds = [...new Set(bookingIds)];
    await this.fundEntryBookingsRepository.delete({ fundEntryId });
    if (uniqueIds.length === 0) {
      return;
    }
    const rows = uniqueIds.map((bookingId) =>
      this.fundEntryBookingsRepository.create({
        id: newId(),
        fundEntryId,
        bookingId,
      }),
    );
    await this.fundEntryBookingsRepository.save(rows);
  }

  private async attachBookingIds(
    entries: FundEntries[],
  ): Promise<FundEntryResponse[]> {
    if (entries.length === 0) {
      return [];
    }
    const links = await this.fundEntryBookingsRepository.find({
      where: { fundEntryId: In(entries.map((e) => e.id)) },
    });
    const byEntry = new Map<string, string[]>();
    for (const link of links) {
      const list = byEntry.get(link.fundEntryId) ?? [];
      list.push(link.bookingId);
      byEntry.set(link.fundEntryId, list);
    }
    return entries.map((entry) => ({
      ...entry,
      bookingIds: byEntry.get(entry.id) ?? [],
    }));
  }

  private async toResponse(entry: FundEntries): Promise<FundEntryResponse> {
    const [withBookings] = await this.attachBookingIds([entry]);
    return withBookings;
  }
}
