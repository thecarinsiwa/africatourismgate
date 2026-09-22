import { createHash, randomInt } from 'node:crypto';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, LessThan, Repository } from 'typeorm';
import { newId } from '../../common/utils/uuid';
import {
  EmailOperationVerifications,
  type EmailOperationPurpose,
} from '../../entities/email-operation-verification.entity';
import { EmailService } from '../email/email.service';
import {
  ABANDONMENT_REMINDER_DELAY_MINUTES,
  OPERATION_CODE_LENGTH,
  OPERATION_CODE_TTL_SECONDS,
  RESEND_OPERATION_COOLDOWN_SECONDS,
} from './email-verification.constants';

export type CreateVerificationParams = {
  email: string;
  purpose: EmailOperationPurpose;
  referenceId: string;
  firstName: string;
  metadata?: Record<string, unknown>;
};

export function hashOperationCode(code: string): string {
  return createHash('sha256').update(code.trim()).digest('hex');
}

function generateNumericCode(length = OPERATION_CODE_LENGTH): string {
  if (process.env.E2E_FIXED_OTP === '1') {
    return '0'.repeat(length);
  }
  const max = 10 ** length;
  const num = randomInt(0, max);
  return num.toString().padStart(length, '0');
}

@Injectable()
export class EmailVerificationService {
  private readonly logger = new Logger(EmailVerificationService.name);

  constructor(
    @InjectRepository(EmailOperationVerifications)
    private readonly repository: Repository<EmailOperationVerifications>,
    private readonly emailService: EmailService,
  ) {}

  async createAndSend(
    params: CreateVerificationParams,
  ): Promise<{ verificationId: string; code: string }> {
    const email = params.email.trim().toLowerCase();
    const code = generateNumericCode();
    const codeHash = hashOperationCode(code);

    const invalidateWhere =
      params.purpose === 'register' || params.purpose === 'google_signup'
        ? { email, purpose: params.purpose, verifiedAt: IsNull() }
        : {
            email,
            purpose: params.purpose,
            referenceId: params.referenceId,
            verifiedAt: IsNull(),
          };

    await this.repository.update(invalidateWhere, {
      verifiedAt: new Date(),
      codeHash: `invalidated:${newId()}`,
    });

    const row = this.repository.create({
      id: newId(),
      email,
      purpose: params.purpose,
      referenceId: params.referenceId,
      codeHash,
      expiresAt: new Date(Date.now() + OPERATION_CODE_TTL_SECONDS * 1000),
      verifiedAt: null,
      abandonmentReminderSentAt: null,
      metadata: {
        firstName: params.firstName,
        ...params.metadata,
      },
      createdAt: new Date(),
    });
    await this.repository.save(row);

    const result = await this.emailService.sendOperationAlert({
      to: email,
      firstName: params.firstName,
      purpose: params.purpose,
      code,
      verificationId: row.id,
      expiresInMinutes: Math.ceil(OPERATION_CODE_TTL_SECONDS / 60),
      metadata: params.metadata,
    });
    if (!result.sent) {
      this.logger.warn(
        `Operation alert email was not sent to ${email} (check EMAIL_TRANSPORT / SMTP)`,
      );
    }

    return { verificationId: row.id, code };
  }

  /**
   * Invalidate the current pending verification and send a fresh code.
   * Returns a new verificationId (caller must update the client URL).
   */
  async resendByVerificationId(
    verificationId: string,
  ): Promise<{ verificationId: string }> {
    const id = verificationId.trim();
    const existing = await this.repository.findOne({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Vérification introuvable.');
    }

    if (
      existing.verifiedAt &&
      !existing.codeHash.startsWith('invalidated:')
    ) {
      throw new BadRequestException(
        'Cette vérification a déjà été confirmée. Reconnectez-vous pour recevoir un nouveau code.',
      );
    }

    const ageSeconds = (Date.now() - existing.createdAt.getTime()) / 1000;
    if (ageSeconds < RESEND_OPERATION_COOLDOWN_SECONDS) {
      const retryAfter = Math.ceil(
        RESEND_OPERATION_COOLDOWN_SECONDS - ageSeconds,
      );
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Veuillez patienter ${retryAfter} s avant de renvoyer un code.`,
          retryAfter,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const meta = existing.metadata ?? {};
    const firstName =
      typeof meta.firstName === 'string' && meta.firstName.trim()
        ? meta.firstName.trim()
        : 'Client';

    const { verificationId: nextId } = await this.createAndSend({
      email: existing.email,
      purpose: existing.purpose,
      referenceId: existing.referenceId,
      firstName,
      metadata: meta,
    });

    return { verificationId: nextId };
  }

  async verifyCode(
    verificationId: string,
    code: string,
  ): Promise<EmailOperationVerifications> {
    const id = verificationId.trim();
    const codeHash = hashOperationCode(code);

    let row = await this.repository.findOne({
      where: { id, verifiedAt: IsNull() },
    });

    if (!row) {
      const consumed = await this.repository.findOne({ where: { id } });
      if (
        consumed?.verifiedAt &&
        !consumed.codeHash.startsWith('invalidated:') &&
        consumed.codeHash === codeHash &&
        consumed.expiresAt > new Date()
      ) {
        return consumed;
      }
      throw new BadRequestException('Code de vérification invalide ou expiré.');
    }

    if (row.expiresAt <= new Date()) {
      throw new BadRequestException('Code de vérification invalide ou expiré.');
    }

    if (codeHash !== row.codeHash) {
      throw new BadRequestException('Code de vérification invalide ou expiré.');
    }

    row.verifiedAt = new Date();
    await this.repository.save(row);
    return row;
  }

  async findById(id: string): Promise<EmailOperationVerifications> {
    const row = await this.repository.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException('Vérification introuvable.');
    }
    return row;
  }

  async isVerifiedForReference(
    purpose: EmailOperationPurpose,
    referenceId: string,
  ): Promise<boolean> {
    const row = await this.repository.findOne({
      where: { purpose, referenceId, verifiedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
    if (!row) {
      const verified = await this.repository.findOne({
        where: { purpose, referenceId },
        order: { verifiedAt: 'DESC' },
      });
      return Boolean(verified?.verifiedAt);
    }
    return false;
  }

  async findPendingForAbandonmentReminder(): Promise<EmailOperationVerifications[]> {
    const cutoff = new Date(
      Date.now() - ABANDONMENT_REMINDER_DELAY_MINUTES * 60 * 1000,
    );
    return this.repository.find({
      where: {
        verifiedAt: IsNull(),
        abandonmentReminderSentAt: IsNull(),
        createdAt: LessThan(cutoff),
      },
      take: 50,
    });
  }

  async markAbandonmentReminderSent(id: string): Promise<void> {
    await this.repository.update({ id }, { abandonmentReminderSentAt: new Date() });
  }
}
