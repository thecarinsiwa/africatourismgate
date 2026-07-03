import { createReadStream, existsSync, mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { newId } from '../../../common/utils/uuid';
import {
  BookingIdentityDocuments,
  type BookingIdentityDocumentStatus,
  type BookingIdentityDocumentType,
} from '../../../entities/booking-identity-document.entity';
import { Bookings } from '../../../entities/generated';
import { BookingIdentityDocumentDto } from './dto/booking-identity-document.dto';

export const BOOKING_IDENTITY_DOCUMENT_MAX_BYTES = 10 * 1024 * 1024;

const ALLOWED_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.pdf']);

const UPLOAD_DIR = join(process.cwd(), 'uploads', 'booking-documents');

function toDto(row: BookingIdentityDocuments): BookingIdentityDocumentDto {
  return {
    id: row.id,
    bookingId: row.bookingId,
    userId: row.userId,
    documentType: row.documentType,
    originalFilename: row.originalFilename,
    mimeType: row.mimeType,
    fileSizeBytes: row.fileSizeBytes,
    status: row.status,
    staffNote: row.staffNote,
    reviewedByUserId: row.reviewedByUserId,
    reviewedAt: row.reviewedAt?.toISOString() ?? null,
    version: row.version,
    createdAt: row.createdAt.toISOString(),
  };
}

function assertAllowedUpload(file: Express.Multer.File): void {
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

@Injectable()
export class BookingIdentityDocumentsService {
  constructor(
    @InjectRepository(BookingIdentityDocuments)
    private readonly repository: Repository<BookingIdentityDocuments>,
    @InjectRepository(Bookings)
    private readonly bookingsRepository: Repository<Bookings>,
  ) {}

  async listForBooking(bookingId: string): Promise<BookingIdentityDocumentDto[]> {
    const rows = await this.repository.find({
      where: { bookingId, deletedAt: IsNull() },
      order: { documentType: 'ASC', version: 'DESC', createdAt: 'DESC' },
    });
    return rows.map(toDto);
  }

  async upload(
    booking: Bookings,
    userId: string,
    documentType: BookingIdentityDocumentType,
    file: Express.Multer.File,
  ): Promise<BookingIdentityDocumentDto> {
    if (booking.userId !== userId) {
      throw new ForbiddenException('Access denied.');
    }
    if (!file) {
      throw new BadRequestException('Fichier requis.');
    }
    assertAllowedUpload(file);

    const allowedStatuses: Bookings['status'][] = [
      'pending_approval',
      'pending_payment',
      'confirmed',
    ];
    if (!allowedStatuses.includes(booking.status)) {
      throw new BadRequestException(
        'Les documents ne peuvent pas être déposés pour cette réservation.',
      );
    }

    const latest = await this.repository.findOne({
      where: { bookingId: booking.id, documentType, deletedAt: IsNull() },
      order: { version: 'DESC' },
    });
    if (latest?.status === 'pending_review') {
      throw new BadRequestException(
        'Un document de ce type est déjà en cours de vérification.',
      );
    }

    if (!existsSync(UPLOAD_DIR)) {
      mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const storedFilename = file.filename;
    const version = (latest?.version ?? 0) + 1;

    const row = this.repository.create({
      id: newId(),
      bookingId: booking.id,
      userId,
      documentType,
      originalFilename: file.originalname,
      storedFilename,
      mimeType: file.mimetype,
      fileSizeBytes: file.size,
      status: 'pending_review',
      staffNote: null,
      reviewedByUserId: null,
      reviewedAt: null,
      version,
      deletedAt: null,
    });
    await this.repository.save(row);
    return toDto(row);
  }

  async getFileStream(
    bookingId: string,
    documentId: string,
  ): Promise<{ stream: StreamableFile; mimeType: string; filename: string }> {
    const row = await this.findActiveRow(bookingId, documentId);
    const path = join(UPLOAD_DIR, row.storedFilename);
    if (!existsSync(path)) {
      throw new NotFoundException('Fichier introuvable.');
    }
    return {
      stream: new StreamableFile(createReadStream(path)),
      mimeType: row.mimeType,
      filename: row.originalFilename,
    };
  }

  async approve(
    bookingId: string,
    documentId: string,
    staffUserId: string,
    staffNote?: string,
  ): Promise<BookingIdentityDocumentDto> {
    const row = await this.findActiveRow(bookingId, documentId);
    row.status = 'approved';
    row.staffNote = staffNote?.trim() || null;
    row.reviewedByUserId = staffUserId;
    row.reviewedAt = new Date();
    await this.repository.save(row);
    return toDto(row);
  }

  async requestResubmit(
    bookingId: string,
    documentId: string,
    staffUserId: string,
    staffNote?: string,
  ): Promise<BookingIdentityDocumentDto> {
    const note = staffNote?.trim();
    if (!note) {
      throw new BadRequestException(
        'Indiquez pourquoi une version plus claire est nécessaire.',
      );
    }
    const row = await this.findActiveRow(bookingId, documentId);
    row.status = 'resubmit_requested';
    row.staffNote = note;
    row.reviewedByUserId = staffUserId;
    row.reviewedAt = new Date();
    await this.repository.save(row);
    return toDto(row);
  }

  async reject(
    bookingId: string,
    documentId: string,
    staffUserId: string,
    staffNote?: string,
  ): Promise<BookingIdentityDocumentDto> {
    const row = await this.findActiveRow(bookingId, documentId);
    row.status = 'rejected';
    row.staffNote = staffNote?.trim() || null;
    row.reviewedByUserId = staffUserId;
    row.reviewedAt = new Date();
    await this.repository.save(row);
    return toDto(row);
  }

  private async findActiveRow(
    bookingId: string,
    documentId: string,
  ): Promise<BookingIdentityDocuments> {
    const row = await this.repository.findOne({
      where: { id: documentId, bookingId, deletedAt: IsNull() },
    });
    if (!row) {
      throw new NotFoundException('Document introuvable.');
    }
    return row;
  }

  static parseDocumentType(value: unknown): BookingIdentityDocumentType {
    const allowed: BookingIdentityDocumentType[] = [
      'passport',
      'national_id',
      'drivers_license',
      'other',
    ];
    if (
      typeof value === 'string' &&
      allowed.includes(value as BookingIdentityDocumentType)
    ) {
      return value as BookingIdentityDocumentType;
    }
    throw new BadRequestException('Type de document invalide.');
  }
}

export function bookingIdentityDocumentStorage() {
  return {
    destination: (_req: unknown, _file: Express.Multer.File, cb: (err: Error | null, dest: string) => void) => {
      if (!existsSync(UPLOAD_DIR)) {
        mkdirSync(UPLOAD_DIR, { recursive: true });
      }
      cb(null, UPLOAD_DIR);
    },
    filename: (_req: unknown, file: Express.Multer.File, cb: (err: Error | null, name: string) => void) => {
      const extension = extname(file.originalname || '').toLowerCase();
      cb(null, `${Date.now()}-${randomUUID()}${extension}`);
    },
  };
}

export function bookingIdentityDocumentFileFilter(
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
