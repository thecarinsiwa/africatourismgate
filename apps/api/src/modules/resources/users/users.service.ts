import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Brackets, DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { Users } from '../../../entities/generated';
import { BCRYPT_ROUNDS } from '../../auth/auth.constants';
import { UserDto, toUserDto } from '../../auth/dto/auth-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersListQueryDto } from './dto/users-list-query.dto';

@Injectable()
export class UsersService {
  private readonly crud: CrudService<Users>;

  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {
    this.crud = new CrudService(usersRepository);
  }

  async findAll(
    query: UsersListQueryDto,
  ): Promise<PaginatedResult<UserDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const search = query.search?.trim();

    const qb = this.usersRepository
      .createQueryBuilder('user')
      .where('user.deletedAt IS NULL');

    if (query.status) {
      qb.andWhere('user.status = :status', { status: query.status });
    }

    if (query.organizationId) {
      qb.andWhere('user.organizationId = :organizationId', {
        organizationId: query.organizationId,
      });
    }

    if (search) {
      const pattern = `%${search.toLowerCase()}%`;
      qb.andWhere(
        new Brackets((sub) => {
          sub
            .where('LOWER(user.email) LIKE :pattern', { pattern })
            .orWhere('LOWER(user.firstName) LIKE :pattern', { pattern })
            .orWhere('LOWER(user.lastName) LIKE :pattern', { pattern });
        }),
      );
    }

    qb.orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [rows, total] = await qb.getManyAndCount();

    return {
      data: rows.map(toUserDto),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(id: string): Promise<UserDto> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });
    if (!user || user.deletedAt) {
      throw new NotFoundException(`Resource ${id} not found`);
    }
    return toUserDto(user);
  }

  async create(dto: CreateUserDto, actorUserId?: string): Promise<UserDto> {
    const email = dto.email.trim().toLowerCase();
    await this.assertEmailAvailable(email);

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = await this.crud.create(
      {
        email,
        passwordHash,
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        phone: dto.phone?.trim() ?? null,
        preferredLanguage: dto.preferredLanguage?.trim() ?? null,
        organizationId: dto.organizationId ?? null,
        status: dto.status ?? 'active',
      } as DeepPartial<Users>,
      actorUserId,
    );

    return toUserDto(user);
  }

  async update(
    id: string,
    dto: UpdateUserDto,
    actorUserId?: string,
  ): Promise<UserDto> {
    const existing = await this.usersRepository.findOne({
      where: { id },
    });
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Resource ${id} not found`);
    }

    const payload: DeepPartial<Users> = {};

    if (dto.email !== undefined) {
      const email = dto.email.trim().toLowerCase();
      await this.assertEmailAvailable(email, id);
      payload.email = email;
    }
    if (dto.firstName !== undefined) {
      payload.firstName = dto.firstName.trim();
    }
    if (dto.lastName !== undefined) {
      payload.lastName = dto.lastName.trim();
    }
    if (dto.phone !== undefined) {
      payload.phone = dto.phone?.trim() ?? null;
    }
    if (dto.preferredLanguage !== undefined) {
      payload.preferredLanguage = dto.preferredLanguage?.trim() ?? null;
    }
    if (dto.organizationId !== undefined) {
      payload.organizationId = (dto.organizationId ?? null) as DeepPartial<Users>['organizationId'];
    }
    if (dto.status !== undefined) {
      payload.status = dto.status;
    }
    if (dto.password !== undefined) {
      payload.passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    }

    const user = await this.crud.update(id, payload, actorUserId);
    return toUserDto(user);
  }

  async remove(id: string, actorUserId?: string): Promise<void> {
    await this.crud.remove(id, actorUserId);
  }

  private async assertEmailAvailable(
    email: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await this.usersRepository
      .createQueryBuilder('user')
      .where('LOWER(user.email) = :email', { email: email.toLowerCase() })
      .andWhere('user.deletedAt IS NULL')
      .getOne();

    if (existing && existing.id !== excludeId) {
      throw new ConflictException(
        'Cette adresse e-mail est déjà utilisée par un autre utilisateur.',
      );
    }
  }
}
