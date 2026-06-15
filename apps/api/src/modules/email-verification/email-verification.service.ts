import { createHash, randomInt } from 'node:crypto';
import {
  BadRequestException,
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

    await this.repository.update(
      {
        email,
        purpose: params.purpose,
        referenceId: params.referenceId,
        verifiedAt: IsNull(),
      },
      { verifiedAt: new Date() },
    );

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

    void this.emailService
      .sendOperationAlert({
        to: email,
        firstName: params.firstName,
        purpose: params.purpose,
        code,
        verificationId: row.id,
        expiresInMinutes: Math.ceil(OPERATION_CODE_TTL_SECONDS / 60),
        metadata: params.metadata,
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.warn(`Operation alert email failed for ${email}: ${message}`);
      });

    return { verificationId: row.id, code };
  }

  async verifyCode(
    verificationId: string,
    code: string,
  ): Promise<EmailOperationVerifications> {
    const row = await this.repository.findOne({
      where: { id: verificationId.trim(), verifiedAt: IsNull() },
    });
    if (!row || row.expiresAt <= new Date()) {
      throw new BadRequestException('Code de vérification invalide ou expiré.');
    }

    const codeHash = hashOperationCode(code);
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
