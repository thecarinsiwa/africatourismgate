import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { DeepPartial, Repository } from 'typeorm';
import { newId } from '../../common/utils/uuid';
import { RbacAuditLogs } from '../../entities/generated/rbac.entity';
import { RBAC_EVENT_PERMISSION_DENIED } from './rbac.constants';
import { PermissionsService } from './permissions.service';

export type LogPermissionDeniedParams = {
  actorUserId: string;
  requiredPermissions: string[];
  request: Request;
};

@Injectable()
export class RbacAuditService {
  constructor(
    @InjectRepository(RbacAuditLogs)
    private readonly auditRepo: Repository<RbacAuditLogs>,
    private readonly permissionsService: PermissionsService,
  ) {}

  async logPermissionDenied(params: LogPermissionDeniedParams): Promise<void> {
    const { actorUserId, requiredPermissions, request } = params;
    const firstCode = requiredPermissions[0];
    const permissionId = firstCode
      ? await this.permissionsService.findPermissionIdByCode(firstCode)
      : null;

    const row = this.auditRepo.create({
      id: newId(),
      eventType: RBAC_EVENT_PERMISSION_DENIED,
      actorUserId,
      permissionId: permissionId ?? undefined,
      ipAddress: this.extractIp(request),
      userAgent: request.headers['user-agent']?.slice(0, 512) ?? undefined,
      payload: {
        required: requiredPermissions,
        path: request.url,
        method: request.method,
        matched: false,
      },
    } as DeepPartial<RbacAuditLogs>);

    await this.auditRepo.save(row);
  }

  private extractIp(request: Request): string | undefined {
    const forwarded = request.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0]?.trim();
    }
    return request.ip;
  }
}
