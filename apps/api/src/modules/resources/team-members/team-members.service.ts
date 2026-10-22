import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, QueryFailedError, Repository } from 'typeorm';
import { slugify } from '../../../common/constants/slug';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { TeamMembers } from '../../../entities/team-member.entity';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { TeamMembersListQueryDto } from './dto/team-members-list-query.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';

export const TEAM_MEMBER_SLUG_CONFLICT_MESSAGE =
  'Ce slug est déjà utilisé par un autre membre dans cette langue.';

const SLUG_MAX_LENGTH = 180;

const CONTACT_FIELDS = ['email', 'linkedinUrl', 'xUrl', 'facebookUrl', 'instagramUrl'] as const;

function normalizeContactFields<T extends UpdateTeamMemberDto>(dto: T): T {
  const normalized: T = { ...dto };
  for (const field of CONTACT_FIELDS) {
    const value = normalized[field];
    if (value === undefined) continue;
    normalized[field] = (typeof value === 'string' ? value.trim() : '') || null;
  }
  return normalized;
}

function rethrowDuplicateSlug(error: unknown): void {
  if (
    error instanceof QueryFailedError &&
    (error.driverError as { code?: string })?.code === 'ER_DUP_ENTRY'
  ) {
    throw new ConflictException(TEAM_MEMBER_SLUG_CONFLICT_MESSAGE);
  }
}

@Injectable()
export class TeamMembersService extends CrudService<TeamMembers> {
  constructor(
    @InjectRepository(TeamMembers)
    private readonly teamMembersRepository: Repository<TeamMembers>,
  ) {
    super(teamMembersRepository);
  }

  async createFromDto(dto: CreateTeamMemberDto, actorUserId?: string): Promise<TeamMembers> {
    const locale = dto.locale ?? 'fr';
    const slug = await this.resolveSlug(dto.slug, dto.name, locale);
    const payload = { ...normalizeContactFields(dto), slug } as DeepPartial<TeamMembers>;
    try {
      return await super.create(payload, actorUserId);
    } catch (error) {
      rethrowDuplicateSlug(error);
      throw error;
    }
  }

  async updateFromDto(
    id: string,
    dto: UpdateTeamMemberDto,
    actorUserId?: string,
  ): Promise<TeamMembers> {
    const existing = await this.findOne(id);
    const locale = dto.locale ?? existing.locale;
    const payload = normalizeContactFields(dto) as DeepPartial<TeamMembers>;

    if (dto.slug !== undefined || locale !== existing.locale) {
      const requested = dto.slug === undefined ? existing.slug : dto.slug;
      payload.slug = await this.resolveSlug(requested, dto.name ?? existing.name, locale, id);
    }

    try {
      return await super.update(id, payload, actorUserId);
    } catch (error) {
      rethrowDuplicateSlug(error);
      throw error;
    }
  }

  /**
   * An explicit slug must be free in the locale (soft-deleted rows included: the
   * unique key covers them). An empty slug is generated from the name with a
   * numeric suffix when needed.
   */
  private async resolveSlug(
    requested: string | null | undefined,
    name: string,
    locale: string,
    excludeId?: string,
  ): Promise<string> {
    const explicit = requested?.trim();
    if (explicit) {
      if (await this.isSlugTaken(explicit, locale, excludeId)) {
        throw new ConflictException(TEAM_MEMBER_SLUG_CONFLICT_MESSAGE);
      }
      return explicit;
    }

    const base = slugify(name, SLUG_MAX_LENGTH - 4) || 'member';
    let candidate = base;
    for (let suffix = 2; await this.isSlugTaken(candidate, locale, excludeId); suffix += 1) {
      candidate = `${base}-${suffix}`;
    }
    return candidate;
  }

  private async isSlugTaken(slug: string, locale: string, excludeId?: string): Promise<boolean> {
    const qb = this.teamMembersRepository
      .createQueryBuilder('member')
      .withDeleted()
      .where('member.slug = :slug', { slug })
      .andWhere('member.locale = :locale', { locale });
    if (excludeId) {
      qb.andWhere('member.id != :excludeId', { excludeId });
    }
    return (await qb.getCount()) > 0;
  }

  override async findAll(
    query: TeamMembersListQueryDto,
  ): Promise<PaginatedResult<TeamMembers>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.teamMembersRepository
      .createQueryBuilder('member')
      .where('member.deletedAt IS NULL');

    const search = query.search?.trim();
    if (search) {
      qb.andWhere(
        '(member.name LIKE :term OR member.role LIKE :term OR member.bio LIKE :term)',
        { term: `%${search}%` },
      );
    }

    if (query.status) {
      qb.andWhere('member.status = :status', { status: query.status });
    }

    if (query.locale) {
      qb.andWhere('member.locale = :locale', { locale: query.locale });
    }

    qb.orderBy('member.sortOrder', 'ASC')
      .addOrderBy('member.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }
}
