import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { TeamMembers } from '../../../entities/team-member.entity';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { TeamMembersListQueryDto } from './dto/team-members-list-query.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';

@Injectable()
export class TeamMembersService extends CrudService<TeamMembers> {
  constructor(
    @InjectRepository(TeamMembers)
    private readonly teamMembersRepository: Repository<TeamMembers>,
  ) {
    super(teamMembersRepository);
  }

  createFromDto(dto: CreateTeamMemberDto, actorUserId?: string): Promise<TeamMembers> {
    return super.create(dto as DeepPartial<TeamMembers>, actorUserId);
  }

  updateFromDto(
    id: string,
    dto: UpdateTeamMemberDto,
    actorUserId?: string,
  ): Promise<TeamMembers> {
    return super.update(id, dto as DeepPartial<TeamMembers>, actorUserId);
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
