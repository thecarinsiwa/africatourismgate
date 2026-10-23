import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { OrgScopeService } from '../../../common/org-scope/org-scope.service';
import {
  Activities,
  ActivityBookingRequests,
} from '../../../entities/generated';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import {
  availabilityForBookingRequestStatus,
} from '../../email/activity-booking-request.email.templates';
import { EmailService } from '../../email/email.service';
import { ActivityBookingRequestDto } from './dto/activity-booking-request.dto';
import { ActivityBookingRequestsListQueryDto } from './dto/activity-booking-requests-list-query.dto';
import { ActivityBookingRequestStatusEmailPreviewDto } from './dto/activity-booking-request-status-email-preview.dto';
import { UpdateActivityBookingRequestStatusDto } from './dto/update-activity-booking-request-status.dto';

@Injectable()
export class ActivityBookingRequestsService {
  private readonly logger = new Logger(ActivityBookingRequestsService.name);

  constructor(
    @InjectRepository(ActivityBookingRequests)
    private readonly requestsRepository: Repository<ActivityBookingRequests>,
    @InjectRepository(Activities)
    private readonly activitiesRepository: Repository<Activities>,
    private readonly orgScopeService: OrgScopeService,
    private readonly emailService: EmailService,
  ) {}

  async findAllForUser(
    query: ActivityBookingRequestsListQueryDto,
    user: AuthUserDto,
  ): Promise<PaginatedResult<ActivityBookingRequestDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const organizationId =
      await this.orgScopeService.resolveCatalogListOrganizationId(
        user,
        query.organizationId,
      );

    const qb = this.requestsRepository
      .createQueryBuilder('request')
      .where('request.deletedAt IS NULL');

    if (organizationId) {
      qb.andWhere(
        '(request.organizationId = :organizationId OR request.organizationId IS NULL)',
        { organizationId },
      );
    }

    if (query.activityId) {
      qb.andWhere('request.activityId = :activityId', {
        activityId: query.activityId,
      });
    }

    if (query.status) {
      qb.andWhere('request.status = :status', { status: query.status });
    }

    const search = query.search?.trim();
    if (search) {
      qb.andWhere(
        '(request.fullName LIKE :term OR request.email LIKE :term)',
        { term: `%${search}%` },
      );
    }

    qb.orderBy('request.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [rows, total] = await qb.getManyAndCount();

    return {
      data: rows.map((row) => this.toDto(row)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOneForUser(
    id: string,
    user: AuthUserDto,
  ): Promise<ActivityBookingRequestDto> {
    const row = await this.findScopedRequest(id, user);
    return this.toDto(row);
  }

  async previewStatusEmailForUser(
    id: string,
    status: UpdateActivityBookingRequestStatusDto['status'],
    user: AuthUserDto,
  ): Promise<ActivityBookingRequestStatusEmailPreviewDto> {
    const row = await this.findScopedRequest(id, user);
    const activityTitle = await this.resolveActivityTitle(row.activityId);
    const rendered = await this.emailService.previewActivityBookingRequestStatus({
      to: row.email,
      fullName: row.fullName,
      activityId: row.activityId,
      activityTitle,
      preferredDate: this.toDateOnly(row.preferredDate),
      participants: row.participants,
      requestId: row.id,
      status,
      webUrl: process.env.NEXT_PUBLIC_WEB_URL,
    });

    return {
      ...rendered,
      availability: availabilityForBookingRequestStatus(status),
      status,
    };
  }

  async updateStatusForUser(
    id: string,
    dto: UpdateActivityBookingRequestStatusDto,
    user: AuthUserDto,
  ): Promise<ActivityBookingRequestDto> {
    const row = await this.findScopedRequest(id, user);
    const previousStatus = row.status;
    row.status = dto.status;
    row.updatedByUserId = user.id;
    const saved = await this.requestsRepository.save(row);

    if (previousStatus !== dto.status) {
      const activityTitle = await this.resolveActivityTitle(saved.activityId);
      void this.emailService
        .sendActivityBookingRequestStatus({
          to: saved.email,
          fullName: saved.fullName,
          activityId: saved.activityId,
          activityTitle,
          preferredDate: this.toDateOnly(saved.preferredDate),
          participants: saved.participants,
          requestId: saved.id,
          status: dto.status,
          webUrl: process.env.NEXT_PUBLIC_WEB_URL,
        })
        .catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : String(err);
          this.logger.warn(
            `Failed to send status email for booking request ${saved.id}: ${msg}`,
          );
        });
    }

    return this.toDto(saved);
  }

  private async resolveActivityTitle(activityId: string): Promise<string> {
    const activity = await this.activitiesRepository.findOne({
      where: { id: activityId },
    });
    return activity?.title?.trim() || 'Activity';
  }

  private async findScopedRequest(
    id: string,
    user: AuthUserDto,
  ): Promise<ActivityBookingRequests> {
    const row = await this.requestsRepository.findOne({ where: { id } });
    if (!row || row.deletedAt) {
      throw new NotFoundException('Demande de réservation introuvable.');
    }

    if (row.organizationId) {
      await this.orgScopeService.assertCanAccessOrganization(
        user,
        row.organizationId,
      );
    } else {
      const activity = await this.activitiesRepository.findOne({
        where: { id: row.activityId },
      });
      if (activity?.organizationId) {
        await this.orgScopeService.assertCanAccessOrganization(
          user,
          activity.organizationId,
        );
      }
    }

    return row;
  }

  private toDto(row: ActivityBookingRequests): ActivityBookingRequestDto {
    return {
      id: row.id,
      activityId: row.activityId,
      organizationId: row.organizationId,
      fullName: row.fullName,
      email: row.email,
      phone: row.phone,
      preferredDate: this.toDateOnly(row.preferredDate),
      participants: row.participants,
      message: row.message,
      status: row.status,
      createdAt:
        row.createdAt instanceof Date
          ? row.createdAt.toISOString()
          : String(row.createdAt),
      updatedAt:
        row.updatedAt instanceof Date
          ? row.updatedAt.toISOString()
          : row.updatedAt
            ? String(row.updatedAt)
            : null,
    };
  }

  private toDateOnly(value: string | Date): string {
    if (typeof value === 'string') {
      return value.slice(0, 10);
    }
    return value.toISOString().slice(0, 10);
  }
}
