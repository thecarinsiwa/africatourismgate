import { createReadStream, existsSync, mkdirSync, unlinkSync } from 'node:fs';
import { extname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, In, IsNull, Repository } from 'typeorm';
import { CrudService } from '../../../common/crud/crud.service';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { newId } from '../../../common/utils/uuid';
import {
  ExpenseRequests,
  FundExitAttachments,
  FundExitBookings,
  FundExitStatus,
  FundExits,
} from '../../../entities/fund-exit.entity';
import { Bookings } from '../../../entities/generated';
import { ExpenseRequestsService } from '../expense-requests/expense-requests.service';
import { TreasuryAuditService } from '../treasury-audit/treasury-audit.service';
import { CreateFundExitDto } from './dto/create-fund-exit.dto';
import { FundExitAttachmentDto } from './dto/fund-exit-attachment.dto';
import { FundExitsListQueryDto } from './dto/fund-exits-list-query.dto';
import { TransitionFundExitDto } from './dto/transition-fund-exit.dto';
import { UpdateFundExitDto } from './dto/update-fund-exit.dto';
import { isFundExitTransitionAllowed } from './fund-exit-transitions';

/** Domain rule TRESO-017 / §6 : décaissement uniquement si besoin autorisé */
const DISBURSABLE_EXPENSE_STATUSES = ['authorized'] as const;

export const FUND_EXIT_ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;

const ALLOWED_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.pdf']);

const UPLOAD_DIR = join(process.cwd(), 'uploads', 'fund-exit-attachments');

export type FundExitResponse = FundExits & {
  bookingIds: string[];
  attachments?: FundExitAttachmentDto[];
};

export function assertAllowedFundExitAttachment(
  file: Express.Multer.File,
): void {
  const extension = extname(file.originalname || '').toLowerCase();
  if (
    !ALLOWED_MIMES.has(file.mimetype) ||
    !ALLOWED_EXTENSIONS.has(extension)
  ) {
    throw new BadRequestException(
      'Format non accepté. Utilisez JPEG, PNG, WebP ou PDF (max 10 Mo).',
    );
  }
}

export function ensureFundExitAttachmentUploadDir(): string {
  if (!existsSync(UPLOAD_DIR)) {
    mkdirSync(UPLOAD_DIR, { recursive: true });
  }
  return UPLOAD_DIR;
}

export function fundExitAttachmentStorage() {
  return {
    destination: (
      _req: unknown,
      _file: Express.Multer.File,
      cb: (err: Error | null, dest: string) => void,
    ) => {
      cb(null, ensureFundExitAttachmentUploadDir());
    },
    filename: (
      _req: unknown,
      file: Express.Multer.File,
      cb: (err: Error | null, name: string) => void,
    ) => {
      const extension = extname(file.originalname || '').toLowerCase();
      cb(null, `${Date.now()}-${randomUUID()}${extension}`);
    },
  };
}

export function fundExitAttachmentFileFilter(
  _req: unknown,
  file: Express.Multer.File,
  cb: (err: Error | null, accept: boolean) => void,
): void {
  const extension = extname(file.originalname || '').toLowerCase();
  if (
    !ALLOWED_MIMES.has(file.mimetype) ||
    !ALLOWED_EXTENSIONS.has(extension)
  ) {
    cb(null, false);
    return;
  }
  cb(null, true);
}

function toAttachmentDto(row: FundExitAttachments): FundExitAttachmentDto {
  return {
    id: row.id,
    originalFilename: row.originalFilename,
    storedFilename: row.storedFilename,
    mimeType: row.mimeType,
    fileSizeBytes: row.fileSizeBytes,
    uploadedByUserId: row.uploadedByUserId,
    createdAt: row.createdAt.toISOString(),
  };
}

@Injectable()
export class FundExitsService extends CrudService<FundExits> {
  constructor(
    @InjectRepository(FundExits)
    private readonly fundExitsRepository: Repository<FundExits>,
    @InjectRepository(FundExitBookings)
    private readonly fundExitBookingsRepository: Repository<FundExitBookings>,
    @InjectRepository(FundExitAttachments)
    private readonly fundExitAttachmentsRepository: Repository<FundExitAttachments>,
    @InjectRepository(ExpenseRequests)
    private readonly expenseRequestsRepository: Repository<ExpenseRequests>,
    @InjectRepository(Bookings)
    private readonly bookingsRepository: Repository<Bookings>,
    private readonly expenseRequestsService: ExpenseRequestsService,
    private readonly treasuryAudit: TreasuryAuditService,
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
    await this.treasuryAudit.log({
      organizationId: exit.organizationId,
      entityType: 'fund_exit',
      entityId: exit.id,
      action: 'create',
      actorType: 'user',
      actorId: actorUserId ?? null,
      oldJson: null,
      newJson: this.exitAuditSnapshot(exit, bookingIds ?? []),
    });
    return this.toResponse(exit, true);
  }

  async updateFromDto(
    id: string,
    dto: UpdateFundExitDto,
    actorUserId?: string,
  ): Promise<FundExitResponse> {
    const existing = await this.findOne(id);
    this.assertNotVoided(existing);
    const oldBookingIds = await this.listBookingIds(id);
    const oldJson = this.exitAuditSnapshot(existing, oldBookingIds);

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
    const newBookingIds =
      bookingIds !== undefined ? bookingIds : oldBookingIds;
    await this.treasuryAudit.log({
      organizationId: exit.organizationId,
      entityType: 'fund_exit',
      entityId: exit.id,
      action: 'update',
      actorType: 'user',
      actorId: actorUserId ?? null,
      oldJson,
      newJson: this.exitAuditSnapshot(exit, newBookingIds),
    });
    return this.toResponse(exit, true);
  }

  async findOneDto(id: string): Promise<FundExitResponse> {
    const exit = await this.findOne(id);
    return this.toResponse(exit, true);
  }

  /**
   * State-machine transition: draft → disbursed → recorded.
   * `recorded` requires ≥1 attachment; closes linked expense request when authorized.
   */
  async transition(
    id: string,
    dto: TransitionFundExitDto,
    actorUserId: string,
  ): Promise<FundExitResponse> {
    const existing = await this.findOne(id);
    this.assertNotVoided(existing);

    const fromStatus = existing.status;
    const toStatus = dto.toStatus as FundExitStatus;

    if (!isFundExitTransitionAllowed(fromStatus, toStatus)) {
      throw new BadRequestException(
        `Illegal transition: ${fromStatus} → ${toStatus}`,
      );
    }

    if (toStatus === 'recorded') {
      const attachments = await this.fundExitAttachmentsRepository.count({
        where: { fundExitId: id, deletedAt: IsNull() },
      });
      if (attachments < 1) {
        throw new BadRequestException(
          'At least one supporting document is required before marking as recorded',
        );
      }
    }

    const exit = await super.update(
      id,
      { status: toStatus } as DeepPartial<FundExits>,
      actorUserId,
    );

    await this.treasuryAudit.log({
      organizationId: exit.organizationId,
      entityType: 'fund_exit',
      entityId: exit.id,
      action: 'transition',
      actorType: 'user',
      actorId: actorUserId,
      oldJson: { status: fromStatus },
      newJson: {
        status: toStatus,
        comment: dto.comment?.trim() || null,
      },
    });

    if (toStatus === 'recorded') {
      const expenseRequest = await this.expenseRequestsRepository.findOne({
        where: { id: existing.expenseRequestId },
      });
      if (expenseRequest && expenseRequest.status === 'authorized') {
        await this.expenseRequestsService.transition(
          expenseRequest.id,
          {
            toStatus: 'closed',
            comment:
              dto.comment?.trim() ||
              `Closed after fund exit ${id} recorded`,
          },
          actorUserId,
          { skipPermissionCheck: true },
        );
      }
    }

    return this.toResponse(exit, true);
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

  /** Attach bookings (additive, idempotent). */
  async attachBookings(
    fundExitId: string,
    bookingIds: string[],
  ): Promise<FundExitResponse> {
    const exit = await this.findOne(fundExitId);
    this.assertNotVoided(exit);
    await this.assertBookingsExist(bookingIds);

    const uniqueIds = [...new Set(bookingIds)];
    if (uniqueIds.length === 0) {
      return this.toResponse(exit, true);
    }

    const existing = await this.fundExitBookingsRepository.find({
      where: { fundExitId },
    });
    const alreadyLinked = new Set(existing.map((row) => row.bookingId));
    const toInsert = uniqueIds.filter((id) => !alreadyLinked.has(id));

    if (toInsert.length > 0) {
      const rows = toInsert.map((bookingId) =>
        this.fundExitBookingsRepository.create({
          id: newId(),
          fundExitId,
          bookingId,
        }),
      );
      await this.fundExitBookingsRepository.save(rows);
    }

    return this.toResponse(exit, true);
  }

  async detachBooking(
    fundExitId: string,
    bookingId: string,
  ): Promise<FundExitResponse> {
    const exit = await this.findOne(fundExitId);
    this.assertNotVoided(exit);

    const link = await this.fundExitBookingsRepository.findOne({
      where: { fundExitId, bookingId },
    });
    if (!link) {
      throw new NotFoundException(
        `Booking ${bookingId} is not linked to this fund exit`,
      );
    }
    await this.fundExitBookingsRepository.delete({ id: link.id });
    return this.toResponse(exit, true);
  }

  async listAttachments(fundExitId: string): Promise<FundExitAttachmentDto[]> {
    await this.findOne(fundExitId);
    const rows = await this.fundExitAttachmentsRepository.find({
      where: { fundExitId, deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
    return rows.map(toAttachmentDto);
  }

  async uploadAttachment(
    fundExitId: string,
    file: Express.Multer.File,
    actorUserId?: string,
  ): Promise<FundExitAttachmentDto> {
    const exit = await this.findOne(fundExitId);
    this.assertNotVoided(exit);
    if (!file) {
      throw new BadRequestException(
        'Fichier requis (JPEG, PNG, WebP ou PDF, max 10 Mo).',
      );
    }
    assertAllowedFundExitAttachment(file);

    const row = this.fundExitAttachmentsRepository.create({
      id: newId(),
      fundExitId,
      originalFilename: file.originalname || file.filename,
      storedFilename: file.filename,
      mimeType: file.mimetype,
      fileSizeBytes: file.size,
      uploadedByUserId: actorUserId ?? null,
      deletedAt: null,
    });
    const saved = await this.fundExitAttachmentsRepository.save(row);
    return toAttachmentDto(saved);
  }

  async softDeleteAttachment(
    fundExitId: string,
    attachmentId: string,
  ): Promise<void> {
    const exit = await this.findOne(fundExitId);
    this.assertNotVoided(exit);
    const row = await this.findActiveAttachment(fundExitId, attachmentId);
    row.deletedAt = new Date();
    await this.fundExitAttachmentsRepository.save(row);

    const filePath = join(UPLOAD_DIR, row.storedFilename);
    if (existsSync(filePath)) {
      try {
        unlinkSync(filePath);
      } catch {
        // Metadata already soft-deleted; ignore FS errors.
      }
    }
  }

  async getAttachmentFileStream(
    fundExitId: string,
    attachmentId: string,
  ): Promise<{ file: StreamableFile; mimeType: string; filename: string }> {
    await this.findOne(fundExitId);
    const row = await this.findActiveAttachment(fundExitId, attachmentId);
    const filePath = join(UPLOAD_DIR, row.storedFilename);
    if (!existsSync(filePath)) {
      throw new NotFoundException('Attachment file not found on disk');
    }
    return {
      file: new StreamableFile(createReadStream(filePath)),
      mimeType: row.mimeType,
      filename: row.originalFilename,
    };
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

  private async listBookingIds(fundExitId: string): Promise<string[]> {
    const links = await this.fundExitBookingsRepository.find({
      where: { fundExitId },
    });
    return links.map((link) => link.bookingId);
  }

  private exitAuditSnapshot(
    exit: FundExits,
    bookingIds: string[],
  ): Record<string, unknown> {
    return {
      organizationId: exit.organizationId,
      expenseRequestId: exit.expenseRequestId,
      amountCents: exit.amountCents,
      currency: exit.currency,
      operationDate: exit.operationDate,
      paymentMethod: exit.paymentMethod,
      reference: exit.reference,
      notes: exit.notes,
      status: exit.status,
      bookingIds,
    };
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

  private async findActiveAttachment(
    fundExitId: string,
    attachmentId: string,
  ): Promise<FundExitAttachments> {
    const row = await this.fundExitAttachmentsRepository.findOne({
      where: { id: attachmentId, fundExitId, deletedAt: IsNull() },
    });
    if (!row) {
      throw new NotFoundException('Attachment not found');
    }
    return row;
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

  private async toResponse(
    exit: FundExits,
    includeAttachments: boolean,
  ): Promise<FundExitResponse> {
    const [withBookings] = await this.attachBookingIds([exit]);
    if (!includeAttachments) {
      return withBookings;
    }
    const attachments = await this.listAttachments(exit.id);
    return { ...withBookings, attachments };
  }
}
