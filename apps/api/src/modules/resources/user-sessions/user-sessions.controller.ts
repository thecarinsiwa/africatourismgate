import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { UserSessionDto } from './dto/user-session.dto';
import { UserSessionsListQueryDto } from './dto/user-sessions-list-query.dto';
import { UserSessionsService } from './user-sessions.service';

@ApiTags('user-sessions')
@ApiForbiddenResponse({ description: 'Missing permission or access denied' })
@Controller('user-sessions')
export class UserSessionsController {
  constructor(private readonly service: UserSessionsService) {}

  @Get()
  @ApiOperation({
    summary: 'List active user sessions (scoped to current user unless staff)',
  })
  findAll(
    @Query() query: UserSessionsListQueryDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.findAll(query, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user session by id' })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthUserDto,
  ): Promise<UserSessionDto> {
    return this.service.findOne(id, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke user session (soft-delete)' })
  revoke(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
    return this.service.revoke(id, user.id);
  }
}
