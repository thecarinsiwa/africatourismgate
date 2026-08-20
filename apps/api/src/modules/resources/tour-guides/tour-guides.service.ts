import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import {
  Destinations,
  Organizations,
  TourGuides,
  Users,
} from '../../../entities/generated';
import { CreateTourGuideDto } from './dto/create-tour-guide.dto';
import { toTourGuideDto, TourGuideDto } from './dto/tour-guide.dto';
import { TourGuidesListQueryDto } from './dto/tour-guides-list-query.dto';
import { UpdateTourGuideDto } from './dto/update-tour-guide.dto';

const USER_ALREADY_GUIDE_MESSAGE =
  'Cet utilisateur est déjà enregistré comme guide touristique.';

@Injectable()
export class TourGuidesService extends CrudService<TourGuides> {
  constructor(
    @InjectRepository(TourGuides)
    private readonly tourGuidesRepository: Repository<TourGuides>,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    @InjectRepository(Organizations)
    private readonly organizationsRepository: Repository<Organizations>,
    @InjectRepository(Destinations)
    private readonly destinationsRepository: Repository<Destinations>,
  ) {
    super(tourGuidesRepository);
  }

  async list(query: TourGuidesListQueryDto): Promise<PaginatedResult<TourGuideDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.tourGuidesRepository
      .createQueryBuilder('guide')
      .where('guide.deletedAt IS NULL');

    if (query.type) {
      qb.andWhere('guide.type = :type', { type: query.type });
    }

    if (query.status) {
      qb.andWhere('guide.status = :status', { status: query.status });
    }

    if (query.organizationId) {
      qb.andWhere('guide.organizationId = :organizationId', {
        organizationId: query.organizationId,
      });
    }

    if (query.destinationId) {
      qb.andWhere('JSON_CONTAINS(guide.destinations, :destinationJson)', {
        destinationJson: JSON.stringify(query.destinationId),
      });
    }

    const search = query.search?.trim();
    if (search) {
      qb.andWhere('guide.displayName LIKE :term', { term: `%${search}%` });
    }

    qb.orderBy('guide.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [guides, total] = await qb.getManyAndCount();
    const userById = await this.loadUsersByIds(
      guides.map((g) => g.userId).filter((id): id is string => Boolean(id)),
    );

    return {
      data: guides.map((guide) =>
        toTourGuideDto(guide, guide.userId ? userById.get(guide.userId) : null),
      ),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOneDto(id: string): Promise<TourGuideDto> {
    const guide = await this.requireGuide(id);
    const user = guide.userId
      ? await this.usersRepository.findOne({
          where: { id: guide.userId, deletedAt: IsNull() },
        })
      : null;
    return toTourGuideDto(guide, user);
  }

  async createFromDto(
    dto: CreateTourGuideDto,
    actorUserId?: string,
  ): Promise<TourGuideDto> {
    this.assertTypeUserRules(dto.type, dto.userId ?? null);

    if (dto.type === 'internal' && dto.userId) {
      await this.requireUser(dto.userId);
      await this.assertUserAvailableForGuide(dto.userId);
    }

    const organizationId = dto.organizationId?.trim() || null;
    if (organizationId) {
      await this.requireOrganization(organizationId);
    }

    await this.requireDestinations(dto.destinations);

    const guide = await super.create(
      {
        type: dto.type,
        userId: dto.type === 'internal' ? dto.userId! : null,
        organizationId,
        displayName: dto.displayName.trim(),
        bio: dto.bio?.trim() || null,
        photoUrl: dto.photoUrl?.trim() || null,
        languages: dto.languages.map((l) => l.trim()).filter(Boolean),
        destinations: dto.destinations,
        status: dto.status ?? 'active',
      },
      actorUserId,
    );

    const user =
      guide.userId != null
        ? await this.usersRepository.findOne({
            where: { id: guide.userId, deletedAt: IsNull() },
          })
        : null;
    return toTourGuideDto(guide, user);
  }

  async updateFromDto(
    id: string,
    dto: UpdateTourGuideDto,
    actorUserId?: string,
  ): Promise<TourGuideDto> {
    const existing = await this.requireGuide(id);
    const nextType = dto.type ?? existing.type;
    const nextUserId =
      dto.userId !== undefined ? dto.userId : existing.userId;
    const effectiveUserId = nextType === 'internal' ? nextUserId : null;

    this.assertTypeUserRules(nextType, effectiveUserId);

    if (nextType === 'internal' && effectiveUserId) {
      await this.requireUser(effectiveUserId);
      if (effectiveUserId !== existing.userId) {
        await this.assertUserAvailableForGuide(effectiveUserId, id);
      }
    }

    if (dto.organizationId !== undefined && dto.organizationId !== null) {
      await this.requireOrganization(dto.organizationId);
    }

    if (dto.destinations !== undefined) {
      await this.requireDestinations(dto.destinations);
    }

    const payload: Partial<TourGuides> = {};

    if (dto.type !== undefined) payload.type = dto.type;
    if (dto.userId !== undefined || dto.type !== undefined) {
      payload.userId = nextType === 'internal' ? effectiveUserId : null;
    }
    if (dto.organizationId !== undefined) {
      payload.organizationId = dto.organizationId;
    }
    if (dto.displayName !== undefined) {
      payload.displayName = dto.displayName.trim();
    }
    if (dto.bio !== undefined) payload.bio = dto.bio?.trim() || null;
    if (dto.photoUrl !== undefined) payload.photoUrl = dto.photoUrl?.trim() || null;
    if (dto.languages !== undefined) {
      payload.languages = dto.languages.map((l) => l.trim()).filter(Boolean);
    }
    if (dto.destinations !== undefined) payload.destinations = dto.destinations;
    if (dto.status !== undefined) payload.status = dto.status;

    const updated = await super.update(id, payload, actorUserId);
    const user =
      updated.userId != null
        ? await this.usersRepository.findOne({
            where: { id: updated.userId, deletedAt: IsNull() },
          })
        : null;
    return toTourGuideDto(updated, user);
  }

  async removeDto(id: string, actorUserId?: string): Promise<void> {
    await this.requireGuide(id);
    await super.remove(id, actorUserId);
  }

  async requireActiveGuide(id: string): Promise<TourGuides> {
    const guide = await this.requireGuide(id);
    if (guide.status !== 'active') {
      throw new BadRequestException('Ce guide touristique est inactif.');
    }
    return guide;
  }

  private async requireGuide(id: string): Promise<TourGuides> {
    const guide = await this.tourGuidesRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!guide) {
      throw new NotFoundException(`Guide touristique ${id} introuvable.`);
    }
    return guide;
  }

  private assertTypeUserRules(
    type: 'internal' | 'external',
    userId: string | null,
  ): void {
    if (type === 'internal' && !userId) {
      throw new BadRequestException(
        "Un guide interne doit être lié à un compte utilisateur.",
      );
    }
    if (type === 'external' && userId) {
      throw new BadRequestException(
        'Un guide externe ne doit pas être lié à un compte utilisateur.',
      );
    }
  }

  private async assertUserAvailableForGuide(
    userId: string,
    excludeGuideId?: string,
  ): Promise<void> {
    const existing = await this.tourGuidesRepository.findOne({
      where: { userId, deletedAt: IsNull() },
    });
    if (existing && existing.id !== excludeGuideId) {
      throw new ConflictException(USER_ALREADY_GUIDE_MESSAGE);
    }
  }

  private async requireUser(userId: string): Promise<Users> {
    const user = await this.usersRepository.findOne({
      where: { id: userId, deletedAt: IsNull() },
    });
    if (!user) {
      throw new NotFoundException(`Utilisateur ${userId} introuvable.`);
    }
    return user;
  }

  private async requireOrganization(organizationId: string): Promise<Organizations> {
    const organization = await this.organizationsRepository.findOne({
      where: { id: organizationId, deletedAt: IsNull() },
    });
    if (!organization) {
      throw new NotFoundException(`Organisation ${organizationId} introuvable.`);
    }
    return organization;
  }

  private async requireDestinations(destinationIds: string[]): Promise<void> {
    if (!destinationIds.length) return;
    const rows = await this.destinationsRepository.find({
      where: { id: In(destinationIds), deletedAt: IsNull() },
    });
    if (rows.length !== destinationIds.length) {
      throw new BadRequestException('Une ou plusieurs destinations sont invalides.');
    }
  }

  private async loadUsersByIds(userIds: string[]): Promise<Map<string, Users>> {
    const unique = [...new Set(userIds)];
    if (!unique.length) return new Map();
    const rows = await this.usersRepository.find({
      where: { id: In(unique), deletedAt: IsNull() },
    });
    return new Map(rows.map((row) => [row.id, row]));
  }
}
