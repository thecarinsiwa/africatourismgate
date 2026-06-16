import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { containsMaskChars } from '../../../common/masking/mask-account-number';
import { OrgScopeService } from '../../../common/org-scope/org-scope.service';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { newId } from '../../../common/utils/uuid';
import { CrudService } from '../../../common/crud/crud.service';
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
export class OrganizationBankAccountsService extends CrudService<OrganizationBankAccounts> {
  constructor(
    @InjectRepository(OrganizationBankAccounts)
    private readonly accountsRepository: Repository<OrganizationBankAccounts>,
    private readonly orgScopeService: OrgScopeService,
    private readonly permissionsService: PermissionsService,
  ) {
    super(accountsRepository);
  }

  async list(
    query: OrganizationBankAccountsListQueryDto,
    user: AuthUserDto,
  ): Promise<PaginatedResult<OrganizationBankAccountDto>> {
    const organizationId = await this.orgScopeService.resolveOrganizationId(
      user,
      query.organizationId,
    );
    const revealAccountNumber = await this.permissionsService.hasSuperAdminRole(user.id);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const [rows, total] = await this.accountsRepository.findAndCount({
      where: { organizationId, deletedAt: IsNull() },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: rows.map((row) =>
        toOrganizationBankAccountDto(row, { revealAccountNumber }),
      ),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOneDto(
    id: string,
    user: AuthUserDto,
    queryOrganizationId?: string,
  ): Promise<OrganizationBankAccountDto> {
    const organizationId = await this.orgScopeService.resolveOrganizationId(
      user,
      queryOrganizationId,
    );
    const row = await this.requireAccount(id);
    this.orgScopeService.assertRowBelongsToOrg(row.organizationId, organizationId);

    const revealAccountNumber = await this.permissionsService.hasSuperAdminRole(user.id);
    return toOrganizationBankAccountDto(row, { revealAccountNumber });
  }

  async createFromDto(
    dto: CreateOrganizationBankAccountDto,
    user: AuthUserDto,
  ): Promise<OrganizationBankAccountDto> {
    await this.orgScopeService.rejectOrganizationIdInBodyForNonSuperAdmin(
      user,
      dto.organizationId,
    );

    const organizationId = await this.orgScopeService.resolveOrganizationId(
      user,
      dto.organizationId,
    );
    const revealAccountNumber = await this.permissionsService.hasSuperAdminRole(user.id);

    const account = await this.create(
      {
        id: newId(),
        organizationId,
        bankName: dto.bankName.trim(),
        accountName: dto.accountName.trim(),
        accountNumber: dto.accountNumber.trim(),
        swiftBic: dto.swiftBic?.trim() || null,
        currency: dto.currency.trim().toUpperCase(),
        isDefault: dto.isDefault ? 1 : 0,
      },
      user.id,
    );

    return toOrganizationBankAccountDto(account, { revealAccountNumber });
  }

  async updateFromDto(
    id: string,
    dto: UpdateOrganizationBankAccountDto,
    user: AuthUserDto,
    queryOrganizationId?: string,
  ): Promise<OrganizationBankAccountDto> {
    const organizationId = await this.orgScopeService.resolveOrganizationId(
      user,
      queryOrganizationId,
    );
    const row = await this.requireAccount(id);
    this.orgScopeService.assertRowBelongsToOrg(row.organizationId, organizationId);

    if (dto.accountNumber !== undefined && containsMaskChars(dto.accountNumber)) {
      throw new BadRequestException('Numéro de compte invalide.');
    }

    const updated = await this.update(
      id,
      {
        ...(dto.bankName !== undefined ? { bankName: dto.bankName.trim() } : {}),
        ...(dto.accountName !== undefined ? { accountName: dto.accountName.trim() } : {}),
        ...(dto.accountNumber !== undefined
          ? { accountNumber: dto.accountNumber.trim() }
          : {}),
        ...(dto.swiftBic !== undefined ? { swiftBic: dto.swiftBic?.trim() || null } : {}),
        ...(dto.currency !== undefined
          ? { currency: dto.currency.trim().toUpperCase() }
          : {}),
        ...(dto.isDefault !== undefined ? { isDefault: dto.isDefault ? 1 : 0 } : {}),
      },
      user.id,
    );

    const revealAccountNumber = await this.permissionsService.hasSuperAdminRole(user.id);
    return toOrganizationBankAccountDto(updated, { revealAccountNumber });
  }

  async removeScoped(
    id: string,
    user: AuthUserDto,
    queryOrganizationId?: string,
  ): Promise<void> {
    const organizationId = await this.orgScopeService.resolveOrganizationId(
      user,
      queryOrganizationId,
    );
    const row = await this.requireAccount(id);
    this.orgScopeService.assertRowBelongsToOrg(row.organizationId, organizationId);
    await this.remove(id, user.id);
  }

  private async requireAccount(id: string): Promise<OrganizationBankAccounts> {
    const row = await this.accountsRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!row) {
      throw new NotFoundException(`Compte bancaire ${id} introuvable.`);
    }
    return row;
  }
}
