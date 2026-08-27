import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthUserDto } from '../../modules/auth/dto/auth-user.dto';
import { PermissionsService } from '../../modules/rbac/permissions.service';

export const PLATFORM_ORG_ID = '00000000-0000-4000-8000-000000000001';

@Injectable()
export class OrgScopeService {
  constructor(private readonly permissionsService: PermissionsService) {}

  async resolveOrganizationId(
    user: AuthUserDto,
    queryOrganizationId?: string,
  ): Promise<string> {
    const isSuperAdmin = await this.permissionsService.hasSuperAdminRole(user.id);

    if (isSuperAdmin) {
      const orgId = queryOrganizationId?.trim() || PLATFORM_ORG_ID;
      return orgId;
    }

    if (!user.organizationId) {
      throw new ForbiddenException(
        'Aucune organisation associée à votre compte.',
      );
    }

    if (
      queryOrganizationId?.trim() &&
      queryOrganizationId.trim() !== user.organizationId
    ) {
      throw new ForbiddenException(
        'Accès refusé à cette organisation.',
      );
    }

    return user.organizationId;
  }

  assertRowBelongsToOrg(
    rowOrganizationId: string,
    resolvedOrganizationId: string,
  ): void {
    if (rowOrganizationId !== resolvedOrganizationId) {
      throw new ForbiddenException(
        'Accès refusé à cette ressource.',
      );
    }
  }

  async assertCanAccessOrganization(
    user: AuthUserDto,
    organizationId: string,
  ): Promise<void> {
    const resolved = await this.resolveOrganizationId(user, organizationId);
    if (resolved !== organizationId) {
      throw new ForbiddenException(
        'Accès refusé à cette organisation.',
      );
    }
  }

  /**
   * Scope optionnel pour listes catalogue (POS / admin).
   * - sans `organizationId` → pas de filtre org (admin voit tout)
   * - avec `organizationId` → validé puis utilisé (NULL partagé OU org)
   */
  async resolveCatalogListOrganizationId(
    user: AuthUserDto,
    queryOrganizationId?: string,
  ): Promise<string | undefined> {
    const trimmed = queryOrganizationId?.trim();
    if (!trimmed) {
      return undefined;
    }
    await this.assertCanAccessOrganization(user, trimmed);
    return trimmed;
  }

  rejectOrganizationIdInBody(
    user: AuthUserDto,
    bodyOrganizationId?: string,
  ): void {
    if (bodyOrganizationId !== undefined && bodyOrganizationId !== null) {
      throw new BadRequestException(
        'organizationId ne peut pas être fourni dans le corps de la requête.',
      );
    }
  }

  async rejectOrganizationIdInBodyForNonSuperAdmin(
    user: AuthUserDto,
    bodyOrganizationId?: string,
  ): Promise<void> {
    const isSuperAdmin = await this.permissionsService.hasSuperAdminRole(user.id);
    if (!isSuperAdmin && bodyOrganizationId !== undefined) {
      this.rejectOrganizationIdInBody(user, bodyOrganizationId);
    }
  }
}
