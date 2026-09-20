import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { NotificationsListQueryDto } from './dto/notifications-list-query.dto';
import {
  StaffNotificationDto,
  StaffNotificationsUnreadCountDto,
} from './dto/staff-notification.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List staff notifications for the current user' })
  @ApiOkResponse({ type: StaffNotificationDto, isArray: true })
  list(
    @CurrentUser() user: AuthUserDto,
    @Query() query: NotificationsListQueryDto,
  ): Promise<StaffNotificationDto[]> {
    return this.service.listForUser(user.id, {
      unreadOnly: query.unreadOnly,
      limit: query.limit,
    });
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Unread notification count for the current user' })
  @ApiOkResponse({ type: StaffNotificationsUnreadCountDto })
  unreadCount(
    @CurrentUser() user: AuthUserDto,
  ): Promise<StaffNotificationsUnreadCountDto> {
    return this.service.unreadCount(user.id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiOkResponse({ type: StaffNotificationDto })
  markRead(
    @CurrentUser() user: AuthUserDto,
    @Param('id') id: string,
  ): Promise<StaffNotificationDto> {
    return this.service.markRead(user.id, id);
  }

  @Post('mark-all-read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all notifications as read for the current user' })
  markAllRead(
    @CurrentUser() user: AuthUserDto,
  ): Promise<{ updated: number }> {
    return this.service.markAllRead(user.id);
  }
}
