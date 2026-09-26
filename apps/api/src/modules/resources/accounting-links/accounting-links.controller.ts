import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { AccountingLinksService } from './accounting-links.service';
import { AccountingPostingService } from './accounting-posting.service';
import { AccountingLinksListQueryDto } from './dto/accounting-links-list-query.dto';
import { CreateAccountingLinkDto } from './dto/create-accounting-link.dto';
import {
  PostAccountingLinkDto,
  SkipAccountingLinkDto,
} from './dto/post-accounting-link.dto';
import { UpdateAccountingLinkDto } from './dto/update-accounting-link.dto';

/**
 * Pont comptable (TRESO-039 → SYSCO-004/005).
 * Mapping DB + Comptabiliser / Ignorer.
 */
@ApiTags('accounting-links')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('accounting-links')
export class AccountingLinksController {
  constructor(
    private readonly service: AccountingLinksService,
    private readonly posting: AccountingPostingService,
  ) {}

  @RequirePermissions('treasury.accounting_link.read')
  @Get('mapping-config')
  @ApiOperation({
    summary:
      'Mapping rules from DB (stub:false) — real chart accounts (SYSCO-004)',
  })
  getMappingConfig(@Query('organizationId') organizationId?: string) {
    return this.service.getMappingConfig(organizationId);
  }

  @RequirePermissions('treasury.accounting_link.read')
  @Post('post')
  @ApiOperation({
    summary:
      'Comptabiliser une opération fond (recorded → écriture posted + link linked)',
  })
  post(
    @Body() dto: PostAccountingLinkDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.posting.postFundOperation(
      dto.fundOpType,
      dto.fundOpId,
      user.id,
    );
  }

  @RequirePermissions('treasury.accounting_link.read')
  @Post('skip')
  @ApiOperation({
    summary: 'Ignorer une opération (status skipped, pas d’écriture)',
  })
  skip(
    @Body() dto: SkipAccountingLinkDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.posting.skipFundOperation(
      dto.organizationId,
      dto.fundOpType,
      dto.fundOpId,
      user.id,
      dto.reason,
    );
  }

  @RequirePermissions('treasury.accounting_link.read')
  @Get()
  @ApiOperation({
    summary: 'List accounting links (paginated)',
  })
  findAll(@Query() query: AccountingLinksListQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('treasury.accounting_link.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get accounting link by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('treasury.accounting_link.read')
  @Post()
  @ApiOperation({
    summary:
      'Create accounting link manually (prefer POST /accounting-links/post)',
  })
  create(
    @Body() dto: CreateAccountingLinkDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.create(dto, user.id);
  }

  @RequirePermissions('treasury.accounting_link.read')
  @Patch(':id')
  @ApiOperation({
    summary: 'Update link (status / journal_entry_id / mapping_rule_key)',
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAccountingLinkDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.update(id, dto, user.id);
  }

  @RequirePermissions('treasury.accounting_link.read')
  @Delete(':id')
  @ApiOperation({
    summary:
      'Soft-delete pending/skipped link (SYSCO-005) — frees unique key for recreate; forbidden if linked',
  })
  softDelete(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
    return this.service.softDelete(id, user.id);
  }
}
