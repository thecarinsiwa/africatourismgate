import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { CrudService } from '../../../common/crud/crud.service';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { newId } from '../../../common/utils/uuid';
import {
  ExpenseRequests,
  ExpenseRequestStatus,
  ExpenseRequestStatusHistory,
} from '../../../entities/fund-exit.entity';
import { PermissionsService } from '../../rbac/permissions.service';
import { CreateExpenseRequestDto } from './dto/create-expense-request.dto';
import { ExpenseRequestsListQueryDto } from './dto/expense-requests-list-query.dto';
import { TransitionExpenseRequestDto } from './dto/transition-expense-request.dto';
import { UpdateExpenseRequestDto } from './dto/update-expense-request.dto';

/** Legal edges: fromStatus → Set of toStatus */
const ALLOWED_TRANSITIONS: Record<
  ExpenseRequestStatus,
  ReadonlySet<ExpenseRequestStatus>
> = {
  draft: new Set(['submitted', 'cancelled']),
  submitted: new Set(['validated', 'rejected', 'cancelled']),
  validated: new Set(['authorized', 'rejected']),
  authorized: new Set(['closed']),
  rejected: new Set(),
  cancelled: new Set(),
  closed: new Set(),
};

function permissionForTransition(
  from: ExpenseRequestStatus,
  to: ExpenseRequestStatus,
): string {
  if (to === 'submitted' || to === 'cancelled') {
    return 'treasury.expense_requests.create';
  }
  if (to === 'validated') {
    return 'treasury.expense_requests.validate';
  }
  if (to === 'rejected') {
    return from === 'submitted'
      ? 'treasury.expense_requests.validate'
      : 'treasury.expense_requests.authorize';
  }
  if (to === 'authorized') {
    return 'treasury.expense_requests.authorize';
  }
  if (to === 'closed') {
    return 'treasury.exits.write';
  }
  throw new BadRequestException(`Unsupported transition ${from} → ${to}`);
}

@Injectable()
export class ExpenseRequestsService extends CrudService<ExpenseRequests> {
  constructor(
    @InjectRepository(ExpenseRequests)
    private readonly expenseRequestsRepository: Repository<ExpenseRequests>,
    @InjectRepository(ExpenseRequestStatusHistory)
    private readonly statusHistoryRepository: Repository<ExpenseRequestStatusHistory>,
    private readonly permissionsService: PermissionsService,
  ) {
    super(expenseRequestsRepository);
  }

  async createFromDto(
    dto: CreateExpenseRequestDto,
    actorUserId?: string,
  ): Promise<ExpenseRequests> {
    const entry = await super.create(
      {
        organizationId: dto.organizationId,
        title: dto.title.trim(),
        description: dto.description.trim(),
        requestedAmountCents: dto.requestedAmountCents,
        currency: dto.currency.toUpperCase(),
        neededByDate: dto.neededByDate
          ? dto.neededByDate.slice(0, 10)
          : null,
        status: 'draft',
        requestedByUserId: actorUserId ?? null,
        requestedByExternalId: null,
        rejectionReason: null,
        submittedAt: null,
        validatedAt: null,
        validatedByUserId: null,
        authorizedAt: null,
        authorizedByUserId: null,
        closedAt: null,
      } as DeepPartial<ExpenseRequests>,
      actorUserId,
    );

    await this.appendHistory({
      expenseRequestId: entry.id,
      fromStatus: null,
      toStatus: 'draft',
      actorUserId,
      comment: null,
    });

    return entry;
  }

  async updateFromDto(
    id: string,
    dto: UpdateExpenseRequestDto,
    actorUserId?: string,
  ): Promise<ExpenseRequests> {
    const existing = await this.findOne(id);
    if (existing.status !== 'draft') {
      throw new BadRequestException(
        'Only draft expense requests can be updated',
      );
    }

    const payload: DeepPartial<ExpenseRequests> = {};
    if (dto.title !== undefined) {
      payload.title = dto.title.trim();
    }
    if (dto.description !== undefined) {
      payload.description = dto.description.trim();
    }
    if (dto.requestedAmountCents !== undefined) {
      payload.requestedAmountCents = dto.requestedAmountCents;
    }
    if (dto.currency !== undefined) {
      payload.currency = dto.currency.toUpperCase();
    }
    if (dto.neededByDate !== undefined) {
      payload.neededByDate = dto.neededByDate
        ? dto.neededByDate.slice(0, 10)
        : null;
    }

    return super.update(id, payload, actorUserId);
  }

  override async findAll(
    query: ExpenseRequestsListQueryDto,
  ): Promise<PaginatedResult<ExpenseRequests>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.expenseRequestsRepository
      .createQueryBuilder('req')
      .where('req.deletedAt IS NULL');

    if (query.organizationId) {
      qb.andWhere('req.organizationId = :organizationId', {
        organizationId: query.organizationId,
      });
    }

    if (query.status) {
      qb.andWhere('req.status = :status', { status: query.status });
    }

    const search = query.search?.trim();
    if (search) {
      qb.andWhere('(req.title LIKE :term OR req.description LIKE :term)', {
        term: `%${search}%`,
      });
    }

    qb.orderBy('req.createdAt', 'DESC')
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

  override async remove(id: string, actorUserId?: string): Promise<void> {
    const existing = await this.findOne(id);
    if (existing.status !== 'draft') {
      throw new BadRequestException(
        'Only draft expense requests can be deleted',
      );
    }
    return super.remove(id, actorUserId);
  }

  async listStatusHistory(
    expenseRequestId: string,
  ): Promise<ExpenseRequestStatusHistory[]> {
    await this.findOne(expenseRequestId);
    return this.statusHistoryRepository.find({
      where: { expenseRequestId },
      order: { createdAt: 'ASC' },
    });
  }

  async transition(
    id: string,
    dto: TransitionExpenseRequestDto,
    actorUserId: string,
  ): Promise<ExpenseRequests> {
    const existing = await this.findOne(id);
    const fromStatus = existing.status;
    const toStatus = dto.toStatus as ExpenseRequestStatus;

    const allowed = ALLOWED_TRANSITIONS[fromStatus];
    if (!allowed.has(toStatus)) {
      throw new BadRequestException(
        `Illegal transition: ${fromStatus} → ${toStatus}`,
      );
    }

    const requiredPermission = permissionForTransition(fromStatus, toStatus);
    const isSuperAdmin =
      await this.permissionsService.hasSuperAdminRole(actorUserId);
    if (!isSuperAdmin) {
      const ok = await this.permissionsService.hasAnyPermission(actorUserId, [
        requiredPermission,
      ]);
      if (!ok) {
        throw new ForbiddenException(
          `Missing permission: ${requiredPermission}`,
        );
      }
    }

    const comment = dto.comment?.trim() || null;
    if (toStatus === 'rejected' && !comment) {
      throw new BadRequestException(
        'A rejection reason (comment) is required',
      );
    }

    const now = new Date();
    const payload: DeepPartial<ExpenseRequests> = { status: toStatus };

    if (toStatus === 'submitted') {
      payload.submittedAt = now;
    } else if (toStatus === 'validated') {
      payload.validatedAt = now;
      payload.validatedByUserId = actorUserId;
    } else if (toStatus === 'authorized') {
      payload.authorizedAt = now;
      payload.authorizedByUserId = actorUserId;
    } else if (toStatus === 'rejected') {
      payload.rejectionReason = comment;
    } else if (toStatus === 'closed') {
      payload.closedAt = now;
    }

    const updated = await super.update(id, payload, actorUserId);

    await this.appendHistory({
      expenseRequestId: id,
      fromStatus,
      toStatus,
      actorUserId,
      comment,
    });

    return updated;
  }

  private async appendHistory(params: {
    expenseRequestId: string;
    fromStatus: ExpenseRequests['status'] | null;
    toStatus: ExpenseRequests['status'];
    actorUserId?: string;
    comment: string | null;
  }): Promise<void> {
    const row = this.statusHistoryRepository.create({
      id: newId(),
      expenseRequestId: params.expenseRequestId,
      fromStatus: params.fromStatus,
      toStatus: params.toStatus,
      actorType: 'user',
      actorId: params.actorUserId ?? null,
      comment: params.comment,
    });
    await this.statusHistoryRepository.save(row);
  }
}
