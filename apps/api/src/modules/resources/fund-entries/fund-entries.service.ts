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
  FundEntries,
  FundEntryAttachments,
  FundEntryBookings,
} from '../../../entities/fund-entry.entity';
import { Bookings } from '../../../entities/generated';
import { CreateFundEntryDto } from './dto/create-fund-entry.dto';
import { FundEntriesListQueryDto } from './dto/fund-entries-list-query.dto';
import { FundEntryAttachmentDto } from './dto/fund-entry-attachment.dto';
import { UpdateFundEntryDto } from './dto/update-fund-entry.dto';

export const FUND_ENTRY_ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;

const ALLOWED_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.pdf']);

const UPLOAD_DIR = join(process.cwd(), 'uploads', 'fund-entry-attachments');

export type FundEntryResponse = FundEntries & {
  bookingIds: string[];
  attachments?: FundEntryAttachmentDto[];
};

export function assertAllowedFundEntryAttachment(
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

export function ensureFundEntryAttachmentUploadDir(): string {
  if (!existsSync(UPLOAD_DIR)) {
    mkdirSync(UPLOAD_DIR, { recursive: true });
  }
  return UPLOAD_DIR;
}

export function fundEntryAttachmentStorage() {
  return {
    destination: (
      _req: unknown,
      _file: Express.Multer.File,
      cb: (err: Error | null, dest: string) => void,
    ) => {
      cb(null, ensureFundEntryAttachmentUploadDir());
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

export function fundEntryAttachmentFileFilter(
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

function toAttachmentDto(row: FundEntryAttachments): FundEntryAttachmentDto {
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
export class FundEntriesService extends CrudService<FundEntries> {
  constructor(
    @InjectRepository(FundEntries)
    private readonly fundEntriesRepository: Repository<FundEntries>,
    @InjectRepository(FundEntryBookings)
    private readonly fundEntryBookingsRepository: Repository<FundEntryBookings>,
    @InjectRepository(FundEntryAttachments)
    private readonly fundEntryAttachmentsRepository: Repository<FundEntryAttachments>,
    @InjectRepository(Bookings)
    private readonly bookingsRepository: Repository<Bookings>,
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
    return this.toResponse(entry, true);
  }

  async updateFromDto(
    id: string,
    dto: UpdateFundEntryDto,
    actorUserId?: string,
  ): Promise<FundEntryResponse> {
    const existing = await this.findOne(id);
    this.assertNotVoided(existing);

    const { bookingIds, ...fields } = dto;
    const payload: DeepPartial<FundEntries> = { ...fields };
    if (fields.currency) {
      payload.currency = fields.currency.toUpperCase();
    }

    const entry = await super.update(id, payload, actorUserId);
    if (bookingIds !== undefined) {
      await this.syncBookingIds(id, bookingIds);
    }
    return this.toResponse(entry, true);
  }

  async findOneDto(id: string): Promise<FundEntryResponse> {
    const entry = await this.findOne(id);
    return this.toResponse(entry, true);
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
    this.assertNotVoided(existing);
    return super.remove(id, actorUserId);
  }

  /** Attach bookings (additive, idempotent). */
  async attachBookings(
    fundEntryId: string,
    bookingIds: string[],
  ): Promise<FundEntryResponse> {
    const entry = await this.findOne(fundEntryId);
    this.assertNotVoided(entry);
    await this.assertBookingsExist(bookingIds);

    const uniqueIds = [...new Set(bookingIds)];
    if (uniqueIds.length === 0) {
      return this.toResponse(entry, true);
    }

    const existing = await this.fundEntryBookingsRepository.find({
      where: { fundEntryId },
    });
    const alreadyLinked = new Set(existing.map((row) => row.bookingId));
    const toInsert = uniqueIds.filter((id) => !alreadyLinked.has(id));

    if (toInsert.length > 0) {
      const rows = toInsert.map((bookingId) =>
        this.fundEntryBookingsRepository.create({
          id: newId(),
          fundEntryId,
          bookingId,
        }),
      );
      await this.fundEntryBookingsRepository.save(rows);
    }

    return this.toResponse(entry, true);
  }

  async detachBooking(
    fundEntryId: string,
    bookingId: string,
  ): Promise<FundEntryResponse> {
    const entry = await this.findOne(fundEntryId);
    this.assertNotVoided(entry);

    const link = await this.fundEntryBookingsRepository.findOne({
      where: { fundEntryId, bookingId },
    });
    if (!link) {
      throw new NotFoundException(
        `Booking ${bookingId} is not linked to this fund entry`,
      );
    }
    await this.fundEntryBookingsRepository.delete({ id: link.id });
    return this.toResponse(entry, true);
  }

  async listAttachments(
    fundEntryId: string,
  ): Promise<FundEntryAttachmentDto[]> {
    await this.findOne(fundEntryId);
    const rows = await this.fundEntryAttachmentsRepository.find({
      where: { fundEntryId, deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
    return rows.map(toAttachmentDto);
  }

  async uploadAttachment(
    fundEntryId: string,
    file: Express.Multer.File,
    actorUserId?: string,
  ): Promise<FundEntryAttachmentDto> {
    const entry = await this.findOne(fundEntryId);
    this.assertNotVoided(entry);
    if (!file) {
      throw new BadRequestException(
        'Fichier requis (JPEG, PNG, WebP ou PDF, max 10 Mo).',
      );
    }
    assertAllowedFundEntryAttachment(file);

    const row = this.fundEntryAttachmentsRepository.create({
      id: newId(),
      fundEntryId,
      originalFilename: file.originalname || file.filename,
      storedFilename: file.filename,
      mimeType: file.mimetype,
      fileSizeBytes: file.size,
      uploadedByUserId: actorUserId ?? null,
      deletedAt: null,
    });
    const saved = await this.fundEntryAttachmentsRepository.save(row);
    return toAttachmentDto(saved);
  }

  async softDeleteAttachment(
    fundEntryId: string,
    attachmentId: string,
  ): Promise<void> {
    const entry = await this.findOne(fundEntryId);
    this.assertNotVoided(entry);
    const row = await this.findActiveAttachment(fundEntryId, attachmentId);
    row.deletedAt = new Date();
    await this.fundEntryAttachmentsRepository.save(row);

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
    fundEntryId: string,
    attachmentId: string,
  ): Promise<{ file: StreamableFile; mimeType: string; filename: string }> {
    await this.findOne(fundEntryId);
    const row = await this.findActiveAttachment(fundEntryId, attachmentId);
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

  private async syncBookingIds(
    fundEntryId: string,
    bookingIds: string[],
  ): Promise<void> {
    const uniqueIds = [...new Set(bookingIds)];
    await this.assertBookingsExist(uniqueIds);
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

  private async assertBookingsExist(bookingIds: string[]): Promise<void> {
    const uniqueIds = [...new Set(bookingIds)];
    if (uniqueIds.length === 0) {
      return;
    }
    const found = await this.bookingsRepository.find({
      where: { id: In(uniqueIds), deletedAt: IsNull() },
      select: ['id'],
    });
    const foundIds = new Set(found.map((b) => b.id));
    const missing = uniqueIds.filter((id) => !foundIds.has(id));
    if (missing.length > 0) {
      throw new NotFoundException(
        `Booking(s) not found: ${missing.join(', ')}`,
      );
    }
  }

  private async findActiveAttachment(
    fundEntryId: string,
    attachmentId: string,
  ): Promise<FundEntryAttachments> {
    const row = await this.fundEntryAttachmentsRepository.findOne({
      where: { id: attachmentId, fundEntryId, deletedAt: IsNull() },
    });
    if (!row) {
      throw new NotFoundException('Attachment not found');
    }
    return row;
  }

  private assertNotVoided(entry: FundEntries): void {
    if (entry.status === 'voided') {
      throw new BadRequestException('Cannot modify a voided fund entry');
    }
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

  private async toResponse(
    entry: FundEntries,
    includeAttachments: boolean,
  ): Promise<FundEntryResponse> {
    const [withBookings] = await this.attachBookingIds([entry]);
    if (!includeAttachments) {
      return withBookings;
    }
    const attachments = await this.listAttachments(entry.id);
    return { ...withBookings, attachments };
  }
}
