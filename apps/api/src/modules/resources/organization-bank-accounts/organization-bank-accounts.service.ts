import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { containsMaskChars } from '../../../common/masking/mask-account-number';
import { OrgScopeService } from '../../../common/org-scope/org-scope.service';
import { newId } from '../../../common/utils/uuid';
import { OrganizationBankAccounts } from '../../../entities/generated';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { PermissionsService } from '../../rbac/permissions.service';
import { CreateOrganizationBankAccountDto } from './dto/create-organization-bank-account.dto';
import {
  OrganizationBankAccountDto,
  toOrganizationBankAccountDto,
} from './dto/organization-bank-account.dto';
import { OrganizationBankAccountsListQueryDto } from './dto/organization-bank-accounts-list-query.dto';
import { UpdateOrganizationBankAccountDto } from './dto/update-organization-bank-account.dto';

@Injectable()
export class OrganizationBankAccountsService {
  constructor(
    @InjectRepository(OrganizationBankAccounts)
    private readonly bankRepository: Repository<OrganizationBankAccounts>,
    private readonly orgScope: OrgScopeService,
    private readonly permissionsService: PermissionsService,
  ) {}

  private async revealAccountNumber(userId: string): Promise<boolean> {
    return this.permissionsService.hasSuperAdminRole(userId);
  }

  async findAll(
    user: AuthUserDto,
    query: OrganizationBankAccountsListQueryDto,
  ): Promise<PaginatedResult<OrganizationBankAccountDto>> {
    const organizationId = await this.orgScope.resolveOrganizationId(
      user,
      query.organizationId,
    );
    const reveal = await this.revealAccountNumber(user.id);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.bankRepository
      .createQueryBuilder('b')
      .where('b.deletedAt IS NULL')
      .andWhere('b.organizationId = :organizationId', { organizationId })
      .orderBy('b.isDefault', 'DESC')
      .addOrderBy('b.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [rows, total] = await qb.getManyAndCount();

    return {
      data: rows.map((row) =>
        toOrganizationBankAccountDto(row, { revealAccountNumber: reveal }),
      ),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(
    user: AuthUserDto,
    id: string,
    queryOrganizationId?: string,
  ): Promise<OrganizationBankAccountDto> {
    const organizationId = await this.orgScope.resolveOrganizationId(
      user,
      queryOrganizationId,
    );
    const reveal = await this.revealAccountNumber(user.id);
    const row = await this.bankRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!row) {
      throw new NotFoundException('Compte bancaire introuvable.');
    }
    this.orgScope.assertRowBelongsToOrg(row.organizationId, organizationId);
    return toOrganizationBankAccountDto(row, { revealAccountNumber: reveal });
  }

  async create(
    user: AuthUserDto,
    dto: CreateOrganizationBankAccountDto,
  ): Promise<OrganizationBankAccountDto> {
    await this.orgScope.rejectOrganizationIdInBodyForNonSuperAdmin(
      user,
      dto.organizationId,
    );

    if (containsMaskChars(dto.accountNumber)) {
      throw new BadRequestException(
        'Le numéro de compte ne doit pas contenir de caractères masqués.',
      );
    }

    const organizationId = await this.orgScope.resolveOrganizationId(
      user,
      dto.organizationId,
    );
    const reveal = await this.revealAccountNumber(user.id);

    if (dto.isDefault) {
      await this.clearDefaultForOrg(organizationId, user.id);
    }

    const row = this.bankRepository.create({
      id: newId(),
      organizationId,
      bankName: dto.bankName.trim(),
      accountName: dto.accountName.trim(),
      accountNumber: dto.accountNumber.trim(),
      swiftBic: dto.swiftBic?.trim() ?? '',
      currency: dto.currency.trim().toUpperCase(),
      isDefault: dto.isDefault ? 1 : 0,
      createdByUserId: user.id,
    } as OrganizationBankAccounts);
    const saved = await this.bankRepository.save(row);
    return toOrganizationBankAccountDto(saved, { revealAccountNumber: reveal });
  }

  async update(
    user: AuthUserDto,
    id: string,
    dto: UpdateOrganizationBankAccountDto,
    queryOrganizationId?: string,
  ): Promise<OrganizationBankAccountDto> {
    const organizationId = await this.orgScope.resolveOrganizationId(
      user,
      queryOrganizationId,
    );
    const reveal = await this.revealAccountNumber(user.id);

    const row = await this.bankRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!row) {
      throw new NotFoundException('Compte bancaire introuvable.');
    }
    this.orgScope.assertRowBelongsToOrg(row.organizationId, organizationId);

    if (dto.accountNumber !== undefined) {
      if (containsMaskChars(dto.accountNumber)) {
        throw new BadRequestException(
          'Le numéro de compte ne doit pas contenir de caractères masqués.',
        );
      }
      row.accountNumber = dto.accountNumber.trim();
    }
    if (dto.bankName !== undefined) row.bankName = dto.bankName.trim();
    if (dto.accountName !== undefined) row.accountName = dto.accountName.trim();
    if (dto.swiftBic !== undefined) row.swiftBic = dto.swiftBic?.trim() ?? '';
    if (dto.currency !== undefined) {
      row.currency = dto.currency.trim().toUpperCase();
    }
    if (dto.isDefault === true) {
      await this.clearDefaultForOrg(organizationId, user.id, id);
      row.isDefault = 1;
    } else if (dto.isDefault === false) {
      row.isDefault = 0;
    }
    row.updatedByUserId = user.id;

    const saved = await this.bankRepository.save(row);
    return toOrganizationBankAccountDto(saved, { revealAccountNumber: reveal });
  }

  async remove(
    user: AuthUserDto,
    id: string,
    queryOrganizationId?: string,
  ): Promise<void> {
    const organizationId = await this.orgScope.resolveOrganizationId(
      user,
      queryOrganizationId,
    );
    const row = await this.bankRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!row) {
      throw new NotFoundException('Compte bancaire introuvable.');
    }
    this.orgScope.assertRowBelongsToOrg(row.organizationId, organizationId);
    await this.bankRepository.softDelete(id);
    await this.bankRepository.update(id, {
      deletedByUserId: user.id,
    });
  }

  private async clearDefaultForOrg(
    organizationId: string,
    actorUserId: string,
    excludeId?: string,
  ): Promise<void> {
    const qb = this.bankRepository
      .createQueryBuilder()
      .update()
      .set({ isDefault: 0, updatedByUserId: actorUserId })
      .where('organization_id = :organizationId', { organizationId })
      .andWhere('deleted_at IS NULL')
      .andWhere('is_default = 1');
    if (excludeId) {
      qb.andWhere('id != :excludeId', { excludeId });
    }
    await qb.execute();
  }
}
