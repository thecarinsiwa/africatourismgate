import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { OrgScopeService, PLATFORM_ORG_ID } from '../../../common/org-scope/org-scope.service';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { newId } from '../../../common/utils/uuid';
import { CrudService } from '../../../common/crud/crud.service';
import { Organizations } from '../../../entities/generated';
import { MobileMoneyCountries } from '../../../entities/mobile-money-country.entity';
import { MobileMoneyOperators } from '../../../entities/mobile-money-operator.entity';
import { MobileMoneyPaymentNumbers } from '../../../entities/mobile-money-payment-number.entity';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { CreateMobileMoneyCountryDto } from './dto/create-mobile-money-country.dto';
import { CreateMobileMoneyOperatorDto } from './dto/create-mobile-money-operator.dto';
import { CreateMobileMoneyPaymentNumberDto } from './dto/create-mobile-money-payment-number.dto';
import {
  MobileMoneyCountriesListQueryDto,
  MobileMoneyOperatorsListQueryDto,
  MobileMoneyPaymentNumbersListQueryDto,
} from './dto/mobile-money-list-query.dto';
import {
  MobileMoneyCountryDto,
  MobileMoneyOperatorDto,
  MobileMoneyPaymentNumberDto,
  toMobileMoneyCountryDto,
  toMobileMoneyOperatorDto,
  toMobileMoneyPaymentNumberDto,
} from './dto/mobile-money.dto';
import { PublicMobileMoneyCountryDto } from './dto/public-mobile-money.dto';
import { UpdateMobileMoneyCountryDto } from './dto/update-mobile-money-country.dto';
import { UpdateMobileMoneyOperatorDto } from './dto/update-mobile-money-operator.dto';
import { UpdateMobileMoneyPaymentNumberDto } from './dto/update-mobile-money-payment-number.dto';

@Injectable()
export class MobileMoneyConfigService extends CrudService<MobileMoneyCountries> {
  constructor(
    @InjectRepository(MobileMoneyCountries)
    private readonly countriesRepository: Repository<MobileMoneyCountries>,
    @InjectRepository(MobileMoneyOperators)
    private readonly operatorsRepository: Repository<MobileMoneyOperators>,
    @InjectRepository(MobileMoneyPaymentNumbers)
    private readonly numbersRepository: Repository<MobileMoneyPaymentNumbers>,
    @InjectRepository(Organizations)
    private readonly organizationsRepository: Repository<Organizations>,
    private readonly orgScopeService: OrgScopeService,
  ) {
    super(countriesRepository);
  }

  /** Active countries → operators → numbers for public Mobile Money checkout. */
  async listPublicForPayment(
    organizationSlug?: string,
  ): Promise<PublicMobileMoneyCountryDto[]> {
    const organization = await this.resolvePublicOrganization(organizationSlug);
    const countries = await this.countriesRepository.find({
      where: {
        organizationId: organization.id,
        isActive: true,
        deletedAt: IsNull(),
      },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
    if (countries.length === 0) {
      return [];
    }

    const countryIds = countries.map((c) => c.id);
    const operators = await this.operatorsRepository
      .createQueryBuilder('op')
      .where('op.country_id IN (:...countryIds)', { countryIds })
      .andWhere('op.is_active = 1')
      .andWhere('op.deleted_at IS NULL')
      .orderBy('op.sort_order', 'ASC')
      .addOrderBy('op.name', 'ASC')
      .getMany();

    const operatorIds = operators.map((o) => o.id);
    const numbers =
      operatorIds.length === 0
        ? []
        : await this.numbersRepository
            .createQueryBuilder('num')
            .where('num.operator_id IN (:...operatorIds)', { operatorIds })
            .andWhere('num.is_active = 1')
            .andWhere('num.deleted_at IS NULL')
            .orderBy('num.sort_order', 'ASC')
            .addOrderBy('num.created_at', 'ASC')
            .getMany();

    const numbersByOperator = new Map<string, typeof numbers>();
    for (const number of numbers) {
      const list = numbersByOperator.get(number.operatorId) ?? [];
      list.push(number);
      numbersByOperator.set(number.operatorId, list);
    }

    const operatorsByCountry = new Map<string, typeof operators>();
    for (const operator of operators) {
      const list = operatorsByCountry.get(operator.countryId) ?? [];
      list.push(operator);
      operatorsByCountry.set(operator.countryId, list);
    }

    return countries
      .map((country) => {
        const countryOperators = (operatorsByCountry.get(country.id) ?? [])
          .map((operator) => {
            const opsNumbers = numbersByOperator.get(operator.id) ?? [];
            if (opsNumbers.length === 0) return null;
            return {
              id: operator.id,
              name: operator.name,
              logoUrl: operator.logoUrl ?? null,
              numbers: opsNumbers.map((n) => ({
                id: n.id,
                phoneE164: n.phoneE164,
                label: n.label ?? null,
              })),
            };
          })
          .filter((op): op is NonNullable<typeof op> => op !== null);

        if (countryOperators.length === 0) return null;
        return {
          id: country.id,
          code: country.code,
          name: country.name,
          operators: countryOperators,
        };
      })
      .filter((c): c is NonNullable<typeof c> => c !== null);
  }

  // ── Countries ──────────────────────────────────────────────────────────

  async listCountries(
    query: MobileMoneyCountriesListQueryDto,
    user: AuthUserDto,
  ): Promise<PaginatedResult<MobileMoneyCountryDto>> {
    const organizationId = await this.orgScopeService.resolveOrganizationId(
      user,
      query.organizationId,
    );
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;

    const [rows, total] = await this.countriesRepository.findAndCount({
      where: { organizationId, deletedAt: IsNull() },
      skip: (page - 1) * limit,
      take: limit,
      order: { sortOrder: 'ASC', name: 'ASC' },
    });

    return {
      data: rows.map(toMobileMoneyCountryDto),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findCountryDto(
    id: string,
    user: AuthUserDto,
    queryOrganizationId?: string,
  ): Promise<MobileMoneyCountryDto> {
    const organizationId = await this.orgScopeService.resolveOrganizationId(
      user,
      queryOrganizationId,
    );
    const row = await this.requireCountry(id);
    this.orgScopeService.assertRowBelongsToOrg(row.organizationId, organizationId);
    return toMobileMoneyCountryDto(row);
  }

  async createCountry(
    dto: CreateMobileMoneyCountryDto,
    user: AuthUserDto,
  ): Promise<MobileMoneyCountryDto> {
    await this.orgScopeService.rejectOrganizationIdInBodyForNonSuperAdmin(
      user,
      dto.organizationId,
    );
    const organizationId = await this.orgScopeService.resolveOrganizationId(
      user,
      dto.organizationId,
    );
    const code = dto.code.trim().toUpperCase();
    await this.assertUniqueCountryCode(organizationId, code);

    const row = await this.create(
      {
        id: newId(),
        organizationId,
        code,
        name: dto.name.trim(),
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder ?? 0,
      },
      user.id,
    );
    return toMobileMoneyCountryDto(row);
  }

  async updateCountry(
    id: string,
    dto: UpdateMobileMoneyCountryDto,
    user: AuthUserDto,
    queryOrganizationId?: string,
  ): Promise<MobileMoneyCountryDto> {
    const organizationId = await this.orgScopeService.resolveOrganizationId(
      user,
      queryOrganizationId,
    );
    const row = await this.requireCountry(id);
    this.orgScopeService.assertRowBelongsToOrg(row.organizationId, organizationId);

    const nextCode =
      dto.code !== undefined ? dto.code.trim().toUpperCase() : undefined;
    if (nextCode && nextCode !== row.code) {
      await this.assertUniqueCountryCode(organizationId, nextCode, id);
    }

    const updated = await this.update(
      id,
      {
        ...(nextCode !== undefined ? { code: nextCode } : {}),
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
      },
      user.id,
    );
    return toMobileMoneyCountryDto(updated);
  }

  async removeCountry(
    id: string,
    user: AuthUserDto,
    queryOrganizationId?: string,
  ): Promise<void> {
    const organizationId = await this.orgScopeService.resolveOrganizationId(
      user,
      queryOrganizationId,
    );
    const row = await this.requireCountry(id);
    this.orgScopeService.assertRowBelongsToOrg(row.organizationId, organizationId);

    const operators = await this.operatorsRepository.find({
      where: { countryId: id, deletedAt: IsNull() },
    });
    for (const operator of operators) {
      await this.softDeleteOperatorCascade(operator.id, user.id);
    }
    await this.remove(id, user.id);
  }

  // ── Operators ──────────────────────────────────────────────────────────

  async listOperators(
    query: MobileMoneyOperatorsListQueryDto,
    user: AuthUserDto,
  ): Promise<PaginatedResult<MobileMoneyOperatorDto>> {
    const organizationId = await this.orgScopeService.resolveOrganizationId(
      user,
      query.organizationId,
    );
    const country = await this.requireCountry(query.countryId);
    this.orgScopeService.assertRowBelongsToOrg(country.organizationId, organizationId);

    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const [rows, total] = await this.operatorsRepository.findAndCount({
      where: { countryId: query.countryId, deletedAt: IsNull() },
      skip: (page - 1) * limit,
      take: limit,
      order: { sortOrder: 'ASC', name: 'ASC' },
    });

    return {
      data: rows.map(toMobileMoneyOperatorDto),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOperatorDto(
    id: string,
    user: AuthUserDto,
    queryOrganizationId?: string,
  ): Promise<MobileMoneyOperatorDto> {
    const organizationId = await this.orgScopeService.resolveOrganizationId(
      user,
      queryOrganizationId,
    );
    const row = await this.requireOperatorInOrg(id, organizationId);
    return toMobileMoneyOperatorDto(row);
  }

  async createOperator(
    dto: CreateMobileMoneyOperatorDto,
    user: AuthUserDto,
    queryOrganizationId?: string,
  ): Promise<MobileMoneyOperatorDto> {
    const organizationId = await this.orgScopeService.resolveOrganizationId(
      user,
      queryOrganizationId,
    );
    const country = await this.requireCountry(dto.countryId);
    this.orgScopeService.assertRowBelongsToOrg(country.organizationId, organizationId);

    const entity = this.operatorsRepository.create({
      id: newId(),
      countryId: dto.countryId,
      name: dto.name.trim(),
      logoUrl: dto.logoUrl?.trim() || null,
      isActive: dto.isActive ?? true,
      sortOrder: dto.sortOrder ?? 0,
      createdByUserId: user.id,
    });
    const saved = await this.operatorsRepository.save(entity);
    return toMobileMoneyOperatorDto(saved);
  }

  async updateOperator(
    id: string,
    dto: UpdateMobileMoneyOperatorDto,
    user: AuthUserDto,
    queryOrganizationId?: string,
  ): Promise<MobileMoneyOperatorDto> {
    const organizationId = await this.orgScopeService.resolveOrganizationId(
      user,
      queryOrganizationId,
    );
    const row = await this.requireOperatorInOrg(id, organizationId);

    if (dto.name !== undefined) row.name = dto.name.trim();
    if (dto.logoUrl !== undefined) row.logoUrl = dto.logoUrl?.trim() || null;
    if (dto.isActive !== undefined) row.isActive = dto.isActive;
    if (dto.sortOrder !== undefined) row.sortOrder = dto.sortOrder;
    row.updatedByUserId = user.id;

    const saved = await this.operatorsRepository.save(row);
    return toMobileMoneyOperatorDto(saved);
  }

  async setOperatorLogo(
    id: string,
    logoUrl: string,
    user: AuthUserDto,
    queryOrganizationId?: string,
  ): Promise<MobileMoneyOperatorDto> {
    return this.updateOperator(id, { logoUrl }, user, queryOrganizationId);
  }

  async removeOperator(
    id: string,
    user: AuthUserDto,
    queryOrganizationId?: string,
  ): Promise<void> {
    const organizationId = await this.orgScopeService.resolveOrganizationId(
      user,
      queryOrganizationId,
    );
    await this.requireOperatorInOrg(id, organizationId);
    await this.softDeleteOperatorCascade(id, user.id);
  }

  // ── Payment numbers ────────────────────────────────────────────────────

  async listNumbers(
    query: MobileMoneyPaymentNumbersListQueryDto,
    user: AuthUserDto,
  ): Promise<PaginatedResult<MobileMoneyPaymentNumberDto>> {
    const organizationId = await this.orgScopeService.resolveOrganizationId(
      user,
      query.organizationId,
    );
    await this.requireOperatorInOrg(query.operatorId, organizationId);

    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const [rows, total] = await this.numbersRepository.findAndCount({
      where: { operatorId: query.operatorId, deletedAt: IsNull() },
      skip: (page - 1) * limit,
      take: limit,
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });

    return {
      data: rows.map(toMobileMoneyPaymentNumberDto),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findNumberDto(
    id: string,
    user: AuthUserDto,
    queryOrganizationId?: string,
  ): Promise<MobileMoneyPaymentNumberDto> {
    const organizationId = await this.orgScopeService.resolveOrganizationId(
      user,
      queryOrganizationId,
    );
    const row = await this.requireNumberInOrg(id, organizationId);
    return toMobileMoneyPaymentNumberDto(row);
  }

  async createNumber(
    dto: CreateMobileMoneyPaymentNumberDto,
    user: AuthUserDto,
    queryOrganizationId?: string,
  ): Promise<MobileMoneyPaymentNumberDto> {
    const organizationId = await this.orgScopeService.resolveOrganizationId(
      user,
      queryOrganizationId,
    );
    await this.requireOperatorInOrg(dto.operatorId, organizationId);

    const entity = this.numbersRepository.create({
      id: newId(),
      operatorId: dto.operatorId,
      phoneE164: dto.phoneE164.trim(),
      label: dto.label?.trim() || null,
      isActive: dto.isActive ?? true,
      sortOrder: dto.sortOrder ?? 0,
      createdByUserId: user.id,
    });
    const saved = await this.numbersRepository.save(entity);
    return toMobileMoneyPaymentNumberDto(saved);
  }

  async updateNumber(
    id: string,
    dto: UpdateMobileMoneyPaymentNumberDto,
    user: AuthUserDto,
    queryOrganizationId?: string,
  ): Promise<MobileMoneyPaymentNumberDto> {
    const organizationId = await this.orgScopeService.resolveOrganizationId(
      user,
      queryOrganizationId,
    );
    const row = await this.requireNumberInOrg(id, organizationId);

    if (dto.phoneE164 !== undefined) row.phoneE164 = dto.phoneE164.trim();
    if (dto.label !== undefined) row.label = dto.label?.trim() || null;
    if (dto.isActive !== undefined) row.isActive = dto.isActive;
    if (dto.sortOrder !== undefined) row.sortOrder = dto.sortOrder;
    row.updatedByUserId = user.id;

    const saved = await this.numbersRepository.save(row);
    return toMobileMoneyPaymentNumberDto(saved);
  }

  async removeNumber(
    id: string,
    user: AuthUserDto,
    queryOrganizationId?: string,
  ): Promise<void> {
    const organizationId = await this.orgScopeService.resolveOrganizationId(
      user,
      queryOrganizationId,
    );
    const row = await this.requireNumberInOrg(id, organizationId);
    await this.numbersRepository.softDelete(row.id);
    await this.numbersRepository.update(row.id, {
      deletedByUserId: user.id,
    } as never);
  }

  // ── Helpers ────────────────────────────────────────────────────────────

  private async softDeleteOperatorCascade(
    operatorId: string,
    actorUserId: string,
  ): Promise<void> {
    const numbers = await this.numbersRepository.find({
      where: { operatorId, deletedAt: IsNull() },
    });
    for (const number of numbers) {
      await this.numbersRepository.softDelete(number.id);
      await this.numbersRepository.update(number.id, {
        deletedByUserId: actorUserId,
      } as never);
    }
    await this.operatorsRepository.softDelete(operatorId);
    await this.operatorsRepository.update(operatorId, {
      deletedByUserId: actorUserId,
    } as never);
  }

  private async assertUniqueCountryCode(
    organizationId: string,
    code: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await this.countriesRepository.findOne({
      where: { organizationId, code, deletedAt: IsNull() },
    });
    if (existing && existing.id !== excludeId) {
      throw new BadRequestException(
        `Un pays avec le code ${code} existe déjà pour cette organisation.`,
      );
    }
  }

  private async requireCountry(id: string): Promise<MobileMoneyCountries> {
    const row = await this.countriesRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!row) {
      throw new NotFoundException(`Pays Mobile Money ${id} introuvable.`);
    }
    return row;
  }

  private async requireOperatorInOrg(
    id: string,
    organizationId: string,
  ): Promise<MobileMoneyOperators> {
    const row = await this.operatorsRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!row) {
      throw new NotFoundException(`Opérateur Mobile Money ${id} introuvable.`);
    }
    const country = await this.requireCountry(row.countryId);
    this.orgScopeService.assertRowBelongsToOrg(country.organizationId, organizationId);
    return row;
  }

  private async requireNumberInOrg(
    id: string,
    organizationId: string,
  ): Promise<MobileMoneyPaymentNumbers> {
    const row = await this.numbersRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!row) {
      throw new NotFoundException(`Numéro Mobile Money ${id} introuvable.`);
    }
    await this.requireOperatorInOrg(row.operatorId, organizationId);
    return row;
  }

  private async resolvePublicOrganization(
    organizationSlug?: string,
  ): Promise<Organizations> {
    const slug = organizationSlug?.trim();
    if (slug) {
      const organization = await this.organizationsRepository.findOne({
        where: { slug, deletedAt: IsNull(), status: 'active' },
      });
      if (!organization) {
        throw new NotFoundException('Organisation introuvable.');
      }
      return organization;
    }

    const platform = await this.organizationsRepository.findOne({
      where: { id: PLATFORM_ORG_ID, deletedAt: IsNull() },
    });
    if (!platform) {
      throw new NotFoundException('Organisation plateforme introuvable.');
    }
    return platform;
  }
}
