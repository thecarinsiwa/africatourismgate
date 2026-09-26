import { createHash, randomBytes } from 'node:crypto';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { newId } from '../../../common/utils/uuid';
import {
  TreasuryAccessTokens,
  TreasuryExternalCollaborators,
} from '../../../entities/treasury-external.entity';
import { EmailService } from '../../email/email.service';
import { InviteTreasuryExternalCollaboratorDto } from './dto/invite-treasury-external-collaborator.dto';

const DEFAULT_TTL_HOURS = 72;

export type TreasuryExternalCollaboratorDto = {
  id: string;
  organizationId: string;
  email: string;
  displayName: string | null;
  isActive: boolean;
  scopes: string[];
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string | null;
};

export type TreasuryAccessTokenDto = {
  id: string;
  collaboratorId: string;
  expiresAt: string;
  scopes: string[] | null;
  revokedAt: string | null;
  lastUsedAt: string | null;
  createdByUserId: string | null;
  createdAt: string;
};

export type InviteTreasuryExternalResult = {
  collaborator: TreasuryExternalCollaboratorDto;
  token: TreasuryAccessTokenDto;
  emailSent: boolean;
  /** Raw invite URL — returned when email was not delivered (dev stub) */
  inviteUrl?: string;
};

export type ValidateTreasuryAccessTokenResult = {
  valid: true;
  collaborator: TreasuryExternalCollaboratorDto;
  token: TreasuryAccessTokenDto;
  effectiveScopes: string[];
};

@Injectable()
export class ExternalCollaboratorsService {
  private readonly logger = new Logger(ExternalCollaboratorsService.name);

  constructor(
    @InjectRepository(TreasuryExternalCollaborators)
    private readonly collaboratorsRepo: Repository<TreasuryExternalCollaborators>,
    @InjectRepository(TreasuryAccessTokens)
    private readonly tokensRepo: Repository<TreasuryAccessTokens>,
    private readonly emailService: EmailService,
    private readonly config: ConfigService,
  ) {}

  async invite(
    dto: InviteTreasuryExternalCollaboratorDto,
    actorUserId?: string,
  ): Promise<InviteTreasuryExternalResult> {
    const email = dto.email.trim().toLowerCase();
    const scopes = [...new Set(dto.scopes)];
    if (scopes.length === 0) {
      throw new BadRequestException('At least one scope is required');
    }

    const ttlHours =
      dto.tokenTtlHours ??
      this.readDefaultTtlHours() ??
      DEFAULT_TTL_HOURS;

    let collaborator = await this.collaboratorsRepo.findOne({
      where: {
        organizationId: dto.organizationId,
        email,
        deletedAt: IsNull(),
      },
    });

    if (collaborator) {
      collaborator.displayName =
        dto.displayName?.trim() || collaborator.displayName;
      collaborator.scopes = scopes;
      collaborator.isActive = true;
      collaborator.updatedByUserId = actorUserId ?? null;
      collaborator = await this.collaboratorsRepo.save(collaborator);
    } else {
      // Soft-deleted row with same org+email would still hit UNIQUE — restore if present
      const softDeleted = await this.collaboratorsRepo.findOne({
        where: { organizationId: dto.organizationId, email },
        withDeleted: true,
      });
      if (softDeleted?.deletedAt) {
        softDeleted.deletedAt = null;
        softDeleted.deletedByUserId = null;
        softDeleted.displayName =
          dto.displayName?.trim() || softDeleted.displayName;
        softDeleted.scopes = scopes;
        softDeleted.isActive = true;
        softDeleted.updatedByUserId = actorUserId ?? null;
        collaborator = await this.collaboratorsRepo.save(softDeleted);
      } else {
        collaborator = await this.collaboratorsRepo.save(
          this.collaboratorsRepo.create({
            id: newId(),
            organizationId: dto.organizationId,
            email,
            displayName: dto.displayName?.trim() || null,
            isActive: true,
            scopes,
            createdByUserId: actorUserId ?? null,
          }),
        );
      }
    }

    // Invalidate previous active tokens for this collaborator
    await this.tokensRepo.update(
      { collaboratorId: collaborator.id, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = hashAccessToken(rawToken);
    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

    const tokenRow = await this.tokensRepo.save(
      this.tokensRepo.create({
        id: newId(),
        collaboratorId: collaborator.id,
        tokenHash,
        expiresAt,
        scopes,
        revokedAt: null,
        lastUsedAt: null,
        createdByUserId: actorUserId ?? null,
      }),
    );

    const inviteUrl = `${this.getInviteBaseUrl()}?token=${rawToken}`;
    const ttlLabel =
      ttlHours === 1 ? '1 heure' : `${ttlHours} heures`;

    const mailResult = await this.emailService.sendTreasuryExternalInvite({
      to: collaborator.email,
      displayName:
        collaborator.displayName?.trim() ||
        collaborator.email.split('@')[0] ||
        'Collaborateur',
      inviteUrl,
      ttlLabel,
    });

    if (!mailResult.sent) {
      this.logger.warn(
        `Treasury external invite email not sent to ${collaborator.email}` +
          (mailResult.previewUrl
            ? ` (preview: ${mailResult.previewUrl})`
            : ` — inviteUrl=${inviteUrl}`),
      );
    } else if (mailResult.previewUrl) {
      this.logger.log(
        `Treasury external invite preview: ${mailResult.previewUrl}`,
      );
    }

    const result: InviteTreasuryExternalResult = {
      collaborator: this.toCollaboratorDto(collaborator),
      token: this.toTokenDto(tokenRow),
      emailSent: mailResult.sent,
    };
    if (!mailResult.sent) {
      result.inviteUrl = inviteUrl;
    }
    return result;
  }

  async validateToken(
    rawToken: string,
  ): Promise<ValidateTreasuryAccessTokenResult> {
    const tokenHash = hashAccessToken(rawToken.trim());
    const token = await this.tokensRepo.findOne({ where: { tokenHash } });
    if (!token) {
      throw new UnauthorizedException('Invalid or unknown access token');
    }
    if (token.revokedAt) {
      throw new UnauthorizedException('Access token has been revoked');
    }
    if (token.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Access token has expired');
    }

    const collaborator = await this.collaboratorsRepo.findOne({
      where: { id: token.collaboratorId, deletedAt: IsNull() },
    });
    if (!collaborator) {
      throw new UnauthorizedException('Collaborator not found');
    }
    if (!collaborator.isActive) {
      throw new UnauthorizedException('Collaborator access is deactivated');
    }

    token.lastUsedAt = new Date();
    await this.tokensRepo.save(token);

    const effectiveScopes =
      token.scopes && token.scopes.length > 0
        ? token.scopes
        : collaborator.scopes;

    return {
      valid: true,
      collaborator: this.toCollaboratorDto(collaborator),
      token: this.toTokenDto(token),
      effectiveScopes,
    };
  }

  async revokeToken(
    tokenId: string,
    _actorUserId?: string,
  ): Promise<TreasuryAccessTokenDto> {
    const token = await this.tokensRepo.findOne({ where: { id: tokenId } });
    if (!token) {
      throw new NotFoundException(`Token ${tokenId} not found`);
    }
    if (!token.revokedAt) {
      token.revokedAt = new Date();
      await this.tokensRepo.save(token);
    }
    return this.toTokenDto(token);
  }

  private toCollaboratorDto(
    row: TreasuryExternalCollaborators,
  ): TreasuryExternalCollaboratorDto {
    return {
      id: row.id,
      organizationId: row.organizationId,
      email: row.email,
      displayName: row.displayName,
      isActive: row.isActive,
      scopes: row.scopes ?? [],
      createdByUserId: row.createdByUserId,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt ? row.updatedAt.toISOString() : null,
    };
  }

  private toTokenDto(row: TreasuryAccessTokens): TreasuryAccessTokenDto {
    return {
      id: row.id,
      collaboratorId: row.collaboratorId,
      expiresAt: row.expiresAt.toISOString(),
      scopes: row.scopes,
      revokedAt: row.revokedAt ? row.revokedAt.toISOString() : null,
      lastUsedAt: row.lastUsedAt ? row.lastUsedAt.toISOString() : null,
      createdByUserId: row.createdByUserId,
      createdAt: row.createdAt.toISOString(),
    };
  }

  private readDefaultTtlHours(): number | null {
    const raw = this.config.get<string>('TREASURY_EXTERNAL_INVITE_TTL_HOURS');
    if (!raw?.trim()) return null;
    const n = Number.parseInt(raw.trim(), 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  private getInviteBaseUrl(): string {
    const configured = this.config.get<string>(
      'ADMIN_TREASURY_EXTERNAL_INVITE_URL',
    );
    if (configured?.trim()) {
      return configured.trim().replace(/\/$/, '');
    }
    const adminUrl = (
      process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3001'
    ).replace(/\/$/, '');
    return `${adminUrl}/tresorerie/externe/acces`;
  }
}

function hashAccessToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
