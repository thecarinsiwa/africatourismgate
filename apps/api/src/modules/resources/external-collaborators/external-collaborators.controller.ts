import { Body, Controller, Param, Post } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Public } from '../../auth/decorators/public.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { InviteTreasuryExternalCollaboratorDto } from './dto/invite-treasury-external-collaborator.dto';
import { ValidateTreasuryAccessTokenDto } from './dto/validate-treasury-access-token.dto';
import { ExternalCollaboratorsService } from './external-collaborators.service';

@ApiTags('treasury-external-collaborators')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('treasury-external-collaborators')
export class ExternalCollaboratorsController {
  constructor(private readonly service: ExternalCollaboratorsService) {}

  @RequirePermissions('treasury.externals.manage')
  @Post('invite')
  @ApiOperation({
    summary:
      'Invite external collaborator by email (creates/updates collab + hashed token + email)',
  })
  invite(
    @Body() dto: InviteTreasuryExternalCollaboratorDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.invite(dto, user.id);
  }

  @Public()
  @Post('tokens/validate')
  @ApiUnauthorizedResponse({ description: 'Invalid, expired or revoked token' })
  @ApiOperation({
    summary: 'Validate a raw invite/access token (updates lastUsedAt)',
  })
  validate(@Body() dto: ValidateTreasuryAccessTokenDto) {
    return this.service.validateToken(dto.token);
  }

  @RequirePermissions('treasury.externals.manage')
  @Post('tokens/:tokenId/revoke')
  @ApiOperation({ summary: 'Revoke an access token (invalidate invite link)' })
  revoke(
    @Param('tokenId') tokenId: string,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.revokeToken(tokenId, user.id);
  }
}
