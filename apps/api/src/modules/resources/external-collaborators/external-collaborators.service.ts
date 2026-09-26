import { createHash, randomBytes } from 'node:crypto';
import {
  BadRequestException,
  ForbiddenException,
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
import { TreasuryAuditService } from '../treasury-audit/treasury-audit.service';
import { InviteTreasuryExternalCollaboratorDto } from './dto/invite-treasury-external-collaborator.dto';
import { UpdateTreasuryExternalCollaboratorDto } from './dto/update-treasury-external-collaborator.dto';

const DEFAULT_TTL_HOURS = 72;
const EXPENSE_CREATE_SCOPE = 'expense_requests.create';

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

export type AuditActorMeta = {
  actorUserId?: string;
  ipAddress?: string | null;
  userAgent?: string | null;
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
    private readonly treasuryAudit: TreasuryAuditService,
  ) {}

  async invite(
    dto: InviteTreasuryExternalCollaboratorDto,
    meta: AuditActorMeta = {},
  ): Promise<InviteTreasuryExternalResult> {
    const email = dto.email.trim().toLowerCase();
    const scopes = [...new Set(dto.scopes)];
    if (scopes.length === 0) {
      throw new BadRequestException('At least one scope is required');
    }

    const ttlHours =
      dto.tokenTtlHours ?? this.readDefaultTtlHours() ?? DEFAULT_TTL_HOURS;
    const actorUserId = meta.actorUserId;

    let collaborator = await this.collaboratorsRepo.findOne({
      where: {
        organizationId: dto.organizationId,
        email,
        deletedAt: IsNull(),
      },
    });

    const wasCreate = !collaborator;
    const oldSnapshot = collaborator
      ? this.collaboratorAuditSnapshot(collaborator)
      : null;

    if (collaborator) {
      collaborator.displayName =
        dto.displayName?.trim() || collaborator.displayName;
      collaborator.scopes = scopes;
      collaborator.isActive = true;
      collaborator.updatedByUserId = actorUserId ?? null;
      collaborator = await this.collaboratorsRepo.save(collaborator);
    } else {
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
    const ttlLabel = ttlHours === 1 ? '1 heure' : `${ttlHours} heures`;

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

    await this.treasuryAudit.log({
      organizationId: collaborator.organizationId,
      entityType: 'external_collaborator',
      entityId: collaborator.id,
      action: 'invite',
      actorType: 'user',
      actorId: actorUserId ?? null,
      oldJson: oldSnapshot,
      newJson: {
        ...this.collaboratorAuditSnapshot(collaborator),
        tokenId: tokenRow.id,
        expiresAt: expiresAt.toISOString(),
        emailSent: mailResult.sent,
        created: wasCreate,
      },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

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

  async activate(
    id: string,
    meta: AuditActorMeta = {},
  ): Promise<TreasuryExternalCollaboratorDto> {
    const collaborator = await this.findCollaboratorOrFail(id);
    if (collaborator.isActive) {
      return this.toCollaboratorDto(collaborator);
    }
    const oldJson = this.collaboratorAuditSnapshot(collaborator);
    collaborator.isActive = true;
    collaborator.updatedByUserId = meta.actorUserId ?? null;
    const saved = await this.collaboratorsRepo.save(collaborator);

    await this.treasuryAudit.log({
      organizationId: saved.organizationId,
      entityType: 'external_collaborator',
      entityId: saved.id,
      action: 'activate',
      actorType: 'user',
      actorId: meta.actorUserId ?? null,
      oldJson,
      newJson: this.collaboratorAuditSnapshot(saved),
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return this.toCollaboratorDto(saved);
  }

  async deactivate(
    id: string,
    meta: AuditActorMeta = {},
  ): Promise<TreasuryExternalCollaboratorDto> {
    const collaborator = await this.findCollaboratorOrFail(id);
    const oldJson = this.collaboratorAuditSnapshot(collaborator);

    if (collaborator.isActive) {
      collaborator.isActive = false;
      collaborator.updatedByUserId = meta.actorUserId ?? null;
      await this.collaboratorsRepo.save(collaborator);
    }

    // Refuser tout accès immédiat : révoquer les jetons actifs
    await this.tokensRepo.update(
      { collaboratorId: collaborator.id, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );

    const saved = await this.findCollaboratorOrFail(id);

    await this.treasuryAudit.log({
      organizationId: saved.organizationId,
      entityType: 'external_collaborator',
      entityId: saved.id,
      action: 'deactivate',
      actorType: 'user',
      actorId: meta.actorUserId ?? null,
      oldJson,
      newJson: {
        ...this.collaboratorAuditSnapshot(saved),
        tokensRevoked: true,
      },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return this.toCollaboratorDto(saved);
  }

  async update(
    id: string,
    dto: UpdateTreasuryExternalCollaboratorDto,
    meta: AuditActorMeta = {},
  ): Promise<TreasuryExternalCollaboratorDto> {
    const collaborator = await this.findCollaboratorOrFail(id);
    const oldJson = this.collaboratorAuditSnapshot(collaborator);
    let changed = false;

    if (dto.displayName !== undefined) {
      const next = dto.displayName?.trim() || null;
      if (next !== collaborator.displayName) {
        collaborator.displayName = next;
        changed = true;
      }
    }
    if (dto.scopes !== undefined) {
      const scopes = [...new Set(dto.scopes)];
      if (scopes.length === 0) {
        throw new BadRequestException('At least one scope is required');
      }
      const same =
        scopes.length === collaborator.scopes.length &&
        scopes.every((s) => collaborator.scopes.includes(s));
      if (!same) {
        collaborator.scopes = scopes;
        changed = true;
        // Aligner les jetons actifs encore valides sur les nouveaux scopes
        await this.tokensRepo.update(
          { collaboratorId: collaborator.id, revokedAt: IsNull() },
          { scopes },
        );
      }
    }

    if (!changed) {
      return this.toCollaboratorDto(collaborator);
    }

    collaborator.updatedByUserId = meta.actorUserId ?? null;
    const saved = await this.collaboratorsRepo.save(collaborator);

    await this.treasuryAudit.log({
      organizationId: saved.organizationId,
      entityType: 'external_collaborator',
      entityId: saved.id,
      action: 'update',
      actorType: 'user',
      actorId: meta.actorUserId ?? null,
      oldJson,
      newJson: this.collaboratorAuditSnapshot(saved),
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return this.toCollaboratorDto(saved);
  }

  async validateToken(
    rawToken: string,
    requiredScope?: string,
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

    if (requiredScope && !effectiveScopes.includes(requiredScope)) {
      throw new ForbiddenException(
        `Missing required scope: ${requiredScope}`,
      );
    }

    return {
      valid: true,
      collaborator: this.toCollaboratorDto(collaborator),
      token: this.toTokenDto(token),
      effectiveScopes,
    };
  }

  /**
   * À utiliser par les flux métier (ex. création d’état de besoin via jeton).
   * Refuse si désactivé, jeton invalide, ou scope manquant.
   */
  async assertTokenHasScope(
    rawToken: string,
    requiredScope: string = EXPENSE_CREATE_SCOPE,
  ): Promise<ValidateTreasuryAccessTokenResult> {
    return this.validateToken(rawToken, requiredScope);
  }

  async revokeToken(
    tokenId: string,
    meta: AuditActorMeta = {},
  ): Promise<TreasuryAccessTokenDto> {
    const token = await this.tokensRepo.findOne({ where: { id: tokenId } });
    if (!token) {
      throw new NotFoundException(`Token ${tokenId} not found`);
    }

    const collaborator = await this.collaboratorsRepo.findOne({
      where: { id: token.collaboratorId },
      withDeleted: true,
    });

    const alreadyRevoked = !!token.revokedAt;
    if (!alreadyRevoked) {
      token.revokedAt = new Date();
      await this.tokensRepo.save(token);
    }

    if (collaborator && !alreadyRevoked) {
      await this.treasuryAudit.log({
        organizationId: collaborator.organizationId,
        entityType: 'access_token',
        entityId: token.id,
        action: 'revoke_token',
        actorType: 'user',
        actorId: meta.actorUserId ?? null,
        oldJson: { revokedAt: null, collaboratorId: token.collaboratorId },
        newJson: {
          revokedAt: token.revokedAt?.toISOString() ?? null,
          collaboratorId: token.collaboratorId,
        },
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      });
    }

    return this.toTokenDto(token);
  }

  private async findCollaboratorOrFail(
    id: string,
  ): Promise<TreasuryExternalCollaborators> {
    const row = await this.collaboratorsRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!row) {
      throw new NotFoundException(`External collaborator ${id} not found`);
    }
    return row;
  }

  private collaboratorAuditSnapshot(
    row: TreasuryExternalCollaborators,
  ): Record<string, unknown> {
    return {
      email: row.email,
      displayName: row.displayName,
      isActive: row.isActive,
      scopes: row.scopes ?? [],
    };
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
