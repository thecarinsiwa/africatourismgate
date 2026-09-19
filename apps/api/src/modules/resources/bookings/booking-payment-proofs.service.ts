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
import { DeepPartial, IsNull, Repository } from 'typeorm';
import { newId } from '../../../common/utils/uuid';
import {
  BookingPaymentProofs,
  type BookingPaymentProofMethod,
} from '../../../entities/booking-payment-proof.entity';
import { Bookings, Payments } from '../../../entities/generated';
import { BookingEngineService } from './booking-engine.service';
import type { BookingDetailDto } from './dto/booking-detail.dto';
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

const OFFLINE_PROOF_METHODS: BookingPaymentProofMethod[] = [
  'bank_transfer',
  'mobile_money',
];

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
    @InjectRepository(Payments)
    private readonly paymentsRepository: Repository<Payments>,
    @InjectRepository(Bookings)
    private readonly bookingsRepository: Repository<Bookings>,
    private readonly bookingEngine: BookingEngineService,
  ) {}

  async listForBooking(bookingId: string): Promise<BookingPaymentProofDto[]> {
    const rows = await this.repository.find({
      where: { bookingId, deletedAt: IsNull() },
      order: { version: 'DESC', createdAt: 'DESC' },
    });
    return rows.map(toBookingPaymentProofDto);
  }

  async upload(
    booking: Bookings,
    userId: string,
    paymentMethod: BookingPaymentProofMethod,
    file: Express.Multer.File,
  ): Promise<BookingPaymentProofDto> {
    if (booking.userId !== userId) {
      throw new ForbiddenException('Access denied.');
    }
    if (!file) {
      throw new BadRequestException('Fichier requis.');
    }
    assertAllowedPaymentProofUpload(file);

    if (booking.status !== 'pending_payment') {
      throw new BadRequestException(
        'Une preuve ne peut être déposée que pour une réservation en attente de paiement.',
      );
    }

    const preferred = booking.preferredPaymentMethod;
    if (
      preferred &&
      OFFLINE_PROOF_METHODS.includes(preferred as BookingPaymentProofMethod) &&
      preferred !== paymentMethod
    ) {
      throw new BadRequestException(
        `Cette réservation attend un paiement « ${preferred} ».`,
      );
    }
    if (
      preferred &&
      !OFFLINE_PROOF_METHODS.includes(preferred as BookingPaymentProofMethod)
    ) {
      throw new BadRequestException(
        'Cette réservation n’accepte pas de preuve de paiement hors ligne.',
      );
    }

    const latest = await this.repository.findOne({
      where: { bookingId: booking.id, paymentMethod, deletedAt: IsNull() },
      order: { version: 'DESC' },
    });
    if (latest?.status === 'pending_review') {
      throw new BadRequestException(
        'Une preuve est déjà en cours de vérification.',
      );
    }

    const existingSucceeded = await this.paymentsRepository.findOne({
      where: {
        bookingId: booking.id,
        status: 'succeeded',
        deletedAt: IsNull(),
      },
    });
    if (existingSucceeded) {
      throw new BadRequestException(
        'Un paiement a déjà été enregistré pour cette réservation.',
      );
    }

    const payment = await this.ensurePendingPayment(booking, paymentMethod, userId);

    const storedFilename = file.filename;
    const version = (latest?.version ?? 0) + 1;

    const row = this.repository.create({
      id: newId(),
      bookingId: booking.id,
      paymentId: payment.id,
      userId,
      paymentMethod,
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
    return toBookingPaymentProofDto(row);
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

  async approve(
    bookingId: string,
    proofId: string,
    staffUserId: string,
    staffNote?: string,
  ): Promise<BookingDetailDto> {
    const row = await this.findActiveRow(bookingId, proofId);
    if (row.status !== 'pending_review' && row.status !== 'resubmit_requested') {
      throw new BadRequestException(
        `Cette preuve ne peut pas être approuvée (statut « ${row.status} »).`,
      );
    }

    const booking = await this.bookingsRepository.findOne({
      where: { id: bookingId, deletedAt: IsNull() },
    });
    if (!booking) {
      throw new NotFoundException('Réservation introuvable.');
    }
    if (booking.status !== 'pending_payment') {
      throw new BadRequestException(
        `Validation impossible : statut réservation « ${booking.status} ».`,
      );
    }

    const payment = await this.resolvePaymentForApproval(booking, row, staffUserId);
    payment.status = 'succeeded';
    payment.updatedByUserId = staffUserId;
    await this.paymentsRepository.save(payment);

    row.status = 'approved';
    row.staffNote = staffNote?.trim() || null;
    row.reviewedByUserId = staffUserId;
    row.reviewedAt = new Date();
    row.paymentId = payment.id;
    await this.repository.save(row);

    const confirmReason =
      row.paymentMethod === 'mobile_money'
        ? 'Paiement Mobile Money validé (preuve)'
        : 'Virement bancaire validé (preuve)';
    return this.bookingEngine.confirmBooking(bookingId, staffUserId, confirmReason);
  }

  async requestResubmit(
    bookingId: string,
    proofId: string,
    staffUserId: string,
    staffNote?: string,
  ): Promise<BookingPaymentProofDto> {
    const note = staffNote?.trim();
    if (!note) {
      throw new BadRequestException(
        'Indiquez pourquoi une nouvelle preuve est nécessaire.',
      );
    }
    const row = await this.findActiveRow(bookingId, proofId);
    if (row.status !== 'pending_review') {
      throw new BadRequestException(
        `Impossible de redemander une preuve (statut « ${row.status} »).`,
      );
    }
    row.status = 'resubmit_requested';
    row.staffNote = note;
    row.reviewedByUserId = staffUserId;
    row.reviewedAt = new Date();
    await this.repository.save(row);
    return toBookingPaymentProofDto(row);
  }

  async reject(
    bookingId: string,
    proofId: string,
    staffUserId: string,
    staffNote?: string,
  ): Promise<BookingPaymentProofDto> {
    const row = await this.findActiveRow(bookingId, proofId);
    if (row.status !== 'pending_review' && row.status !== 'resubmit_requested') {
      throw new BadRequestException(
        `Cette preuve ne peut pas être rejetée (statut « ${row.status} »).`,
      );
    }
    row.status = 'rejected';
    row.staffNote = staffNote?.trim() || null;
    row.reviewedByUserId = staffUserId;
    row.reviewedAt = new Date();
    await this.repository.save(row);
    return toBookingPaymentProofDto(row);
  }

  static parsePaymentMethod(value: unknown): BookingPaymentProofMethod {
    if (
      typeof value === 'string' &&
      OFFLINE_PROOF_METHODS.includes(value as BookingPaymentProofMethod)
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

  private async ensurePendingPayment(
    booking: Bookings,
    provider: BookingPaymentProofMethod,
    actorUserId?: string,
  ): Promise<Payments> {
    if (booking.totalCents < 1) {
      throw new BadRequestException('Montant de réservation invalide.');
    }

    const existing = await this.paymentsRepository.findOne({
      where: {
        bookingId: booking.id,
        status: 'pending',
        provider,
        deletedAt: IsNull(),
      },
      order: { createdAt: 'DESC' },
    });
    if (existing) {
      return existing;
    }

    const paymentId = newId();
    const prefix =
      provider === 'mobile_money' ? 'mobile-money' : 'bank-transfer';
    const payment = this.paymentsRepository.create({
      id: paymentId,
      bookingId: booking.id,
      amountCents: booking.totalCents,
      currency: booking.currency,
      status: 'pending',
      provider,
      externalId: `${prefix}-pending-${paymentId}`,
      createdByUserId: actorUserId ?? null,
    } as DeepPartial<Payments>);
    return this.paymentsRepository.save(payment);
  }

  private async resolvePaymentForApproval(
    booking: Bookings,
    proof: BookingPaymentProofs,
    staffUserId: string,
  ): Promise<Payments> {
    if (proof.paymentId) {
      const linked = await this.paymentsRepository.findOne({
        where: {
          id: proof.paymentId,
          bookingId: booking.id,
          deletedAt: IsNull(),
        },
      });
      if (linked) {
        if (linked.status === 'succeeded') {
          throw new BadRequestException(
            'Un paiement a déjà été enregistré pour cette réservation.',
          );
        }
        return linked;
      }
    }

    const succeeded = await this.paymentsRepository.findOne({
      where: {
        bookingId: booking.id,
        status: 'succeeded',
        deletedAt: IsNull(),
      },
    });
    if (succeeded) {
      throw new BadRequestException(
        'Un paiement a déjà été enregistré pour cette réservation.',
      );
    }

    return this.ensurePendingPayment(
      booking,
      proof.paymentMethod,
      staffUserId,
    );
  }
}
