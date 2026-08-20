import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { LoyaltyAccounts } from '../../../entities/generated';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { SuperAdminGuard } from '../../rbac/guards/super-admin.guard';
import { AdjustLoyaltyPointsDto } from './dto/adjust-loyalty-points.dto';
import { AdminLoyaltyAccountListItemDto } from './dto/admin-loyalty-account-list-item.dto';
import {
  CreateLoyaltyAccountDto,
  UpdateLoyaltyAccountDto,
} from './dto/loyalty-account.dto';
import { LoyaltyAccountsListQueryDto } from './dto/loyalty-accounts-list-query.dto';
import { LoyaltyAccountsService } from './loyalty-accounts.service';

@ApiTags('loyalty-accounts')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('loyalty-accounts')
export class LoyaltyAccountsController {
  constructor(private readonly service: LoyaltyAccountsService) {}

  @Get()
  @ApiOperation({
    summary: 'List loyalty accounts (scoped to current user unless staff)',
  })
  findAll(
    @Query() query: LoyaltyAccountsListQueryDto,
    @CurrentUser() user: AuthUserDto,
  ): Promise<{
    data: (LoyaltyAccounts | AdminLoyaltyAccountListItemDto)[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    return this.service.findAll(query, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get loyalty account by id' })
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
    return this.service.findOne(id, user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create loyalty account (staff only)' })
  create(@Body() dto: CreateLoyaltyAccountDto, @CurrentUser() user: AuthUserDto) {
    return this.service.create(dto, user.id);
  }

  @Post(':id/adjust-points')
  @UseGuards(SuperAdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Adjust loyalty points balance (super admin only)' })
  adjustPoints(
    @Param('id') id: string,
    @Body() dto: AdjustLoyaltyPointsDto,
    @CurrentUser() user: AuthUserDto,
  ): Promise<AdminLoyaltyAccountListItemDto> {
    return this.service.adjustPoints(id, dto, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update loyalty account (staff only)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateLoyaltyAccountDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.update(id, dto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete loyalty account (staff only)' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
    return this.service.remove(id, user.id);
  }
}
