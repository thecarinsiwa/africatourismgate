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
  ExpenseRequestActorType,
  ExpenseRequests,
  ExpenseRequestStatus,
  ExpenseRequestStatusHistory,
} from '../../../entities/fund-exit.entity';
import { PermissionsService } from '../../rbac/permissions.service';
import { ExternalCollaboratorsService } from '../external-collaborators/external-collaborators.service';
import { TreasuryAuditService } from '../treasury-audit/treasury-audit.service';
import { CreateExpenseRequestDto } from './dto/create-expense-request.dto';
import { CreateExpenseRequestExternalDto } from './dto/create-expense-request-external.dto';
import { ExpenseRequestsListQueryDto } from './dto/expense-requests-list-query.dto';
import { TransitionExpenseRequestDto } from './dto/transition-expense-request.dto';
import { UpdateExpenseRequestDto } from './dto/update-expense-request.dto';
import {
  isExpenseRequestTransitionAllowed,
  permissionForExpenseRequestTransition,
} from './expense-request-transitions';

const EXTERNAL_CREATE_SCOPE = 'expense_requests.create';

@Injectable()
export class ExpenseRequestsService extends CrudService<ExpenseRequests> {
  constructor(
    @InjectRepository(ExpenseRequests)
    private readonly expenseRequestsRepository: Repository<ExpenseRequests>,
    @InjectRepository(ExpenseRequestStatusHistory)
    private readonly statusHistoryRepository: Repository<ExpenseRequestStatusHistory>,
    private readonly permissionsService: PermissionsService,
    private readonly externalCollaborators: ExternalCollaboratorsService,
    private readonly treasuryAudit: TreasuryAuditService,
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
      actorType: 'user',
      actorId: actorUserId ?? null,
      comment: null,
    });

    return entry;
  }

  /**
   * Création d’un état de besoin par collaborateur externe (jeton invite).
   * Statut initial draft puis auto-soumission → visible dans le circuit Admin.
   */
  async createFromExternalToken(
    dto: CreateExpenseRequestExternalDto,
  ): Promise<ExpenseRequests> {
    const access = await this.externalCollaborators.assertTokenHasScope(
      dto.token,
      EXTERNAL_CREATE_SCOPE,
    );
    const collaborator = access.collaborator;

    const entry = await super.create(
      {
        organizationId: collaborator.organizationId,
        title: dto.title.trim(),
        description: dto.description.trim(),
        requestedAmountCents: dto.requestedAmountCents,
        currency: dto.currency.toUpperCase(),
        neededByDate: dto.neededByDate
          ? dto.neededByDate.slice(0, 10)
          : null,
        status: 'draft',
        requestedByUserId: null,
        requestedByExternalId: collaborator.id,
        rejectionReason: null,
        submittedAt: null,
        validatedAt: null,
        validatedByUserId: null,
        authorizedAt: null,
        authorizedByUserId: null,
        closedAt: null,
      } as DeepPartial<ExpenseRequests>,
      undefined,
    );

    await this.appendHistory({
      expenseRequestId: entry.id,
      fromStatus: null,
      toStatus: 'draft',
      actorType: 'external',
      actorId: collaborator.id,
      comment: null,
    });

    const now = new Date();
    await this.expenseRequestsRepository.update(entry.id, {
      status: 'submitted',
      submittedAt: now,
    });

    await this.appendHistory({
      expenseRequestId: entry.id,
      fromStatus: 'draft',
      toStatus: 'submitted',
      actorType: 'external',
      actorId: collaborator.id,
      comment: null,
    });

    await this.treasuryAudit.log({
      organizationId: collaborator.organizationId,
      entityType: 'expense_request',
      entityId: entry.id,
      action: 'create',
      actorType: 'external',
      actorId: collaborator.id,
      oldJson: null,
      newJson: {
        title: entry.title,
        requestedAmountCents: entry.requestedAmountCents,
        currency: entry.currency,
        status: 'submitted',
        requestedByExternalId: collaborator.id,
      },
    });

    return this.findOne(entry.id);
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

  /**
   * Apply a status transition (state machine). Appends immutable history.
   * Used by HTTP endpoint and by fund-exit recorded → close besoin.
   */
  async transition(
    id: string,
    dto: TransitionExpenseRequestDto,
    actorUserId: string,
    options?: { skipPermissionCheck?: boolean },
  ): Promise<ExpenseRequests> {
    const existing = await this.findOne(id);
    const fromStatus = existing.status;
    const toStatus = dto.toStatus as ExpenseRequestStatus;

    if (!isExpenseRequestTransitionAllowed(fromStatus, toStatus)) {
      throw new BadRequestException(
        `Illegal transition: ${fromStatus} → ${toStatus}`,
      );
    }

    const requiredPermission = permissionForExpenseRequestTransition(
      fromStatus,
      toStatus,
    );
    if (!options?.skipPermissionCheck) {
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
      actorType: 'user',
      actorId: actorUserId,
      comment,
    });

    return updated;
  }

  private async appendHistory(params: {
    expenseRequestId: string;
    fromStatus: ExpenseRequests['status'] | null;
    toStatus: ExpenseRequests['status'];
    actorType: ExpenseRequestActorType;
    actorId: string | null;
    comment: string | null;
  }): Promise<void> {
    const row = this.statusHistoryRepository.create({
      id: newId(),
      expenseRequestId: params.expenseRequestId,
      fromStatus: params.fromStatus,
      toStatus: params.toStatus,
      actorType: params.actorType,
      actorId: params.actorId,
      comment: params.comment,
    });
    await this.statusHistoryRepository.save(row);
  }
}
