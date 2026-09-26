import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { Public } from '../../auth/decorators/public.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { InviteTreasuryExternalCollaboratorDto } from './dto/invite-treasury-external-collaborator.dto';
import { TreasuryExternalCollaboratorsListQueryDto } from './dto/treasury-external-collaborators-list-query.dto';
import { UpdateTreasuryExternalCollaboratorDto } from './dto/update-treasury-external-collaborator.dto';
import { ValidateTreasuryAccessTokenDto } from './dto/validate-treasury-access-token.dto';
import {
  AuditActorMeta,
  ExternalCollaboratorsService,
} from './external-collaborators.service';

@ApiTags('treasury-external-collaborators')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('treasury-external-collaborators')
export class ExternalCollaboratorsController {
  constructor(private readonly service: ExternalCollaboratorsService) {}

  @RequirePermissions('treasury.read', 'treasury.externals.manage')
  @Get()
  @ApiOperation({ summary: 'List external collaborators (paginated)' })
  findAll(@Query() query: TreasuryExternalCollaboratorsListQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('treasury.externals.manage')
  @Post('invite')
  @ApiOperation({
    summary:
      'Invite external collaborator by email (creates/updates collab + hashed token + email)',
  })
  invite(
    @Body() dto: InviteTreasuryExternalCollaboratorDto,
    @CurrentUser() user: AuthUserDto,
    @Req() req: Request,
  ) {
    return this.service.invite(dto, this.actorMeta(user.id, req));
  }

  @Public()
  @Post('tokens/validate')
  @ApiUnauthorizedResponse({ description: 'Invalid, expired or revoked token' })
  @ApiForbiddenResponse({ description: 'Missing required scope' })
  @ApiOperation({
    summary:
      'Validate a raw invite/access token (optional requiredScope; updates lastUsedAt)',
  })
  validate(@Body() dto: ValidateTreasuryAccessTokenDto) {
    return this.service.validateToken(dto.token, dto.requiredScope);
  }

  @RequirePermissions('treasury.externals.manage')
  @Post('tokens/:tokenId/revoke')
  @ApiOperation({ summary: 'Revoke an access token (invalidate invite link)' })
  revoke(
    @Param('tokenId') tokenId: string,
    @CurrentUser() user: AuthUserDto,
    @Req() req: Request,
  ) {
    return this.service.revokeToken(tokenId, this.actorMeta(user.id, req));
  }

  @RequirePermissions('treasury.externals.manage')
  @Post(':id/activate')
  @ApiOperation({ summary: 'Activate an external collaborator' })
  activate(
    @Param('id') id: string,
    @CurrentUser() user: AuthUserDto,
    @Req() req: Request,
  ) {
    return this.service.activate(id, this.actorMeta(user.id, req));
  }

  @RequirePermissions('treasury.externals.manage')
  @Post(':id/deactivate')
  @ApiOperation({
    summary:
      'Deactivate an external collaborator and revoke all active access tokens',
  })
  deactivate(
    @Param('id') id: string,
    @CurrentUser() user: AuthUserDto,
    @Req() req: Request,
  ) {
    return this.service.deactivate(id, this.actorMeta(user.id, req));
  }

  @RequirePermissions('treasury.externals.manage')
  @Patch(':id')
  @ApiOperation({
    summary: 'Update external collaborator display name and/or scopes',
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTreasuryExternalCollaboratorDto,
    @CurrentUser() user: AuthUserDto,
    @Req() req: Request,
  ) {
    return this.service.update(id, dto, this.actorMeta(user.id, req));
  }

  private actorMeta(actorUserId: string, req: Request): AuditActorMeta {
    return {
      actorUserId,
      ipAddress: this.extractIp(req),
      userAgent: req.headers['user-agent'] ?? null,
    };
  }

  private extractIp(request: Request): string | null {
    const forwarded = request.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0]?.trim() || null;
    }
    return request.ip ?? null;
  }
}
