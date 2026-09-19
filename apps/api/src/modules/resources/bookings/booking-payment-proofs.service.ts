import { createReadStream, existsSync, mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import {
  BookingPaymentProofs,
  type BookingPaymentProofMethod,
} from '../../../entities/booking-payment-proof.entity';
import { BookingPaymentProofDto } from './dto/booking-payment-proof.dto';

export const BOOKING_PAYMENT_PROOF_MAX_BYTES = 10 * 1024 * 1024;

const ALLOWED_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.pdf']);

const UPLOAD_DIR = join(process.cwd(), 'uploads', 'payment-proofs');

export function toBookingPaymentProofDto(
  row: BookingPaymentProofs,
): BookingPaymentProofDto {
  return {
    id: row.id,
    bookingId: row.bookingId,
    paymentId: row.paymentId,
    userId: row.userId,
    paymentMethod: row.paymentMethod,
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

export function assertAllowedPaymentProofUpload(file: Express.Multer.File): void {
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

export function ensurePaymentProofUploadDir(): string {
  if (!existsSync(UPLOAD_DIR)) {
    mkdirSync(UPLOAD_DIR, { recursive: true });
  }
  return UPLOAD_DIR;
}

export function bookingPaymentProofStorage() {
  return {
    destination: (
      _req: unknown,
      _file: Express.Multer.File,
      cb: (err: Error | null, dest: string) => void,
    ) => {
      cb(null, ensurePaymentProofUploadDir());
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

export function bookingPaymentProofFileFilter(
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

@Injectable()
export class BookingPaymentProofsService {
  constructor(
    @InjectRepository(BookingPaymentProofs)
    private readonly repository: Repository<BookingPaymentProofs>,
  ) {}

  async listForBooking(bookingId: string): Promise<BookingPaymentProofDto[]> {
    const rows = await this.repository.find({
      where: { bookingId, deletedAt: IsNull() },
      order: { version: 'DESC', createdAt: 'DESC' },
    });
    return rows.map(toBookingPaymentProofDto);
  }

  async getFileStream(
    bookingId: string,
    proofId: string,
  ): Promise<{ stream: StreamableFile; mimeType: string; filename: string }> {
    const row = await this.findActiveRow(bookingId, proofId);
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

  static parsePaymentMethod(value: unknown): BookingPaymentProofMethod {
    const allowed: BookingPaymentProofMethod[] = [
      'bank_transfer',
      'mobile_money',
    ];
    if (
      typeof value === 'string' &&
      allowed.includes(value as BookingPaymentProofMethod)
    ) {
      return value as BookingPaymentProofMethod;
    }
    throw new BadRequestException('Mode de paiement de la preuve invalide.');
  }

  async findActiveRow(
    bookingId: string,
    proofId: string,
  ): Promise<BookingPaymentProofs> {
    const row = await this.repository.findOne({
      where: { id: proofId, bookingId, deletedAt: IsNull() },
    });
    if (!row) {
      throw new NotFoundException('Preuve de paiement introuvable.');
    }
    return row;
  }
}
