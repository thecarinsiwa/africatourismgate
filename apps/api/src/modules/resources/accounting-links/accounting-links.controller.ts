import {
  Body,
  Controller,
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
import { AccountingLinksListQueryDto } from './dto/accounting-links-list-query.dto';
import { CreateAccountingLinkDto } from './dto/create-accounting-link.dto';
import { UpdateAccountingLinkDto } from './dto/update-accounting-link.dto';

/**
 * Stub pont comptable (TRESO-039) — pas de génération d’écritures SYSCOHADA.
 */
@ApiTags('accounting-links')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('accounting-links')
export class AccountingLinksController {
  constructor(private readonly service: AccountingLinksService) {}

  @RequirePermissions('treasury.accounting_link.read')
  @Get('mapping-config')
  @ApiOperation({
    summary:
      'Stub mapping rules skeleton (SYSCOHADA placeholders — no journal generation)',
  })
  getMappingConfig() {
    return this.service.getMappingConfig();
  }

  @RequirePermissions('treasury.accounting_link.read')
  @Get()
  @ApiOperation({
    summary: 'List accounting links (stub bridge, paginated)',
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
      'Create accounting link stub (journal_entry_id optional; no SYSCOHADA write)',
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
    summary: 'Update stub link (status / journal_entry_id / mapping_rule_key)',
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAccountingLinkDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.update(id, dto, user.id);
  }
}
