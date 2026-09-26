import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, In, IsNull, Repository } from 'typeorm';
import { CrudService } from '../../../common/crud/crud.service';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { newId } from '../../../common/utils/uuid';
import {
  ExpenseRequests,
  FundExitBookings,
  FundExits,
} from '../../../entities/fund-exit.entity';
import { Bookings } from '../../../entities/generated';
import { CreateFundExitDto } from './dto/create-fund-exit.dto';
import { FundExitsListQueryDto } from './dto/fund-exits-list-query.dto';
import { UpdateFundExitDto } from './dto/update-fund-exit.dto';

/** Domain rule TRESO-017 / §6 : décaissement uniquement si besoin autorisé */
const DISBURSABLE_EXPENSE_STATUSES = ['authorized'] as const;

export type FundExitResponse = FundExits & { bookingIds: string[] };

@Injectable()
export class FundExitsService extends CrudService<FundExits> {
  constructor(
    @InjectRepository(FundExits)
    private readonly fundExitsRepository: Repository<FundExits>,
    @InjectRepository(FundExitBookings)
    private readonly fundExitBookingsRepository: Repository<FundExitBookings>,
    @InjectRepository(ExpenseRequests)
    private readonly expenseRequestsRepository: Repository<ExpenseRequests>,
    @InjectRepository(Bookings)
    private readonly bookingsRepository: Repository<Bookings>,
  ) {
    super(fundExitsRepository);
  }

  async createFromDto(
    dto: CreateFundExitDto,
    actorUserId?: string,
  ): Promise<FundExitResponse> {
    const expenseRequest = await this.assertDisbursableExpenseRequest(
      dto.expenseRequestId,
    );

    if (expenseRequest.organizationId !== dto.organizationId) {
      throw new BadRequestException(
        'organizationId must match the expense request organization',
      );
    }

    const { bookingIds, ...fields } = dto;
    const exit = await super.create(
      {
        ...fields,
        currency: fields.currency.toUpperCase(),
        operationDate: fields.operationDate.slice(0, 10),
        status: 'draft',
      } as DeepPartial<FundExits>,
      actorUserId,
    );
    await this.syncBookingIds(exit.id, bookingIds ?? []);
    return this.toResponse(exit);
  }

  async updateFromDto(
    id: string,
    dto: UpdateFundExitDto,
    actorUserId?: string,
  ): Promise<FundExitResponse> {
    const existing = await this.findOne(id);
    this.assertNotVoided(existing);

    const { bookingIds, ...fields } = dto;
    const payload: DeepPartial<FundExits> = { ...fields };
    if (fields.currency) {
      payload.currency = fields.currency.toUpperCase();
    }
    if (fields.operationDate) {
      payload.operationDate = fields.operationDate.slice(0, 10);
    }

    const exit = await super.update(id, payload, actorUserId);
    if (bookingIds !== undefined) {
      await this.syncBookingIds(id, bookingIds);
    }
    return this.toResponse(exit);
  }

  async findOneDto(id: string): Promise<FundExitResponse> {
    const exit = await this.findOne(id);
    return this.toResponse(exit);
  }

  override async findAll(
    query: FundExitsListQueryDto,
  ): Promise<PaginatedResult<FundExitResponse>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.fundExitsRepository
      .createQueryBuilder('exit')
      .where('exit.deletedAt IS NULL');

    if (query.organizationId) {
      qb.andWhere('exit.organizationId = :organizationId', {
        organizationId: query.organizationId,
      });
    }

    if (query.expenseRequestId) {
      qb.andWhere('exit.expenseRequestId = :expenseRequestId', {
        expenseRequestId: query.expenseRequestId,
      });
    }

    if (query.dateFrom) {
      qb.andWhere('exit.operationDate >= :dateFrom', {
        dateFrom: query.dateFrom.slice(0, 10),
      });
    }

    if (query.dateTo) {
      qb.andWhere('exit.operationDate <= :dateTo', {
        dateTo: query.dateTo.slice(0, 10),
      });
    }

    if (query.currency) {
      qb.andWhere('exit.currency = :currency', {
        currency: query.currency.toUpperCase(),
      });
    }

    if (query.paymentMethod) {
      qb.andWhere('exit.paymentMethod = :paymentMethod', {
        paymentMethod: query.paymentMethod,
      });
    }

    if (query.status) {
      qb.andWhere('exit.status = :status', { status: query.status });
    }

    if (query.bookingId) {
      qb.andWhere(
        `EXISTS (
          SELECT 1 FROM fund_exit_bookings feb
          WHERE feb.fund_exit_id = exit.id
            AND feb.booking_id = :bookingId
        )`,
        { bookingId: query.bookingId },
      );
    }

    const search = query.search?.trim();
    if (search) {
      qb.andWhere('(exit.reference LIKE :term OR exit.notes LIKE :term)', {
        term: `%${search}%`,
      });
    }

    qb.orderBy('exit.operationDate', 'DESC')
      .addOrderBy('exit.createdAt', 'DESC')
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
    this.assertNotVoided(existing);
    if (existing.status !== 'draft') {
      throw new BadRequestException('Only draft fund exits can be deleted');
    }
    return super.remove(id, actorUserId);
  }

  private async assertDisbursableExpenseRequest(
    expenseRequestId: string,
  ): Promise<ExpenseRequests> {
    const expenseRequest = await this.expenseRequestsRepository.findOne({
      where: { id: expenseRequestId },
    });
    if (!expenseRequest || expenseRequest.deletedAt) {
      throw new NotFoundException(
        `Expense request ${expenseRequestId} not found`,
      );
    }
    if (
      !(DISBURSABLE_EXPENSE_STATUSES as readonly string[]).includes(
        expenseRequest.status,
      )
    ) {
      throw new BadRequestException(
        `Expense request must be authorized to create a fund exit (current status: ${expenseRequest.status})`,
      );
    }
    return expenseRequest;
  }

  private assertNotVoided(exit: FundExits): void {
    if (exit.status === 'voided') {
      throw new BadRequestException('Cannot modify a voided fund exit');
    }
  }

  private async syncBookingIds(
    fundExitId: string,
    bookingIds: string[],
  ): Promise<void> {
    const uniqueIds = [...new Set(bookingIds)];
    await this.assertBookingsExist(uniqueIds);
    await this.fundExitBookingsRepository.delete({ fundExitId });
    if (uniqueIds.length === 0) {
      return;
    }
    const rows = uniqueIds.map((bookingId) =>
      this.fundExitBookingsRepository.create({
        id: newId(),
        fundExitId,
        bookingId,
      }),
    );
    await this.fundExitBookingsRepository.save(rows);
  }

  private async assertBookingsExist(bookingIds: string[]): Promise<void> {
    if (bookingIds.length === 0) {
      return;
    }
    const found = await this.bookingsRepository.find({
      where: { id: In(bookingIds), deletedAt: IsNull() },
      select: ['id'],
    });
    const foundIds = new Set(found.map((b) => b.id));
    const missing = bookingIds.filter((id) => !foundIds.has(id));
    if (missing.length > 0) {
      throw new NotFoundException(
        `Booking(s) not found: ${missing.join(', ')}`,
      );
    }
  }

  private async attachBookingIds(
    exits: FundExits[],
  ): Promise<FundExitResponse[]> {
    if (exits.length === 0) {
      return [];
    }
    const links = await this.fundExitBookingsRepository.find({
      where: { fundExitId: In(exits.map((e) => e.id)) },
    });
    const byExit = new Map<string, string[]>();
    for (const link of links) {
      const list = byExit.get(link.fundExitId) ?? [];
      list.push(link.bookingId);
      byExit.set(link.fundExitId, list);
    }
    return exits.map((exit) => ({
      ...exit,
      bookingIds: byExit.get(exit.id) ?? [],
    }));
  }

  private async toResponse(exit: FundExits): Promise<FundExitResponse> {
    const [withBookings] = await this.attachBookingIds([exit]);
    return withBookings;
  }
}
