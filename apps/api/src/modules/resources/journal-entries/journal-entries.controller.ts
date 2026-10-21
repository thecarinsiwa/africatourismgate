import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { JournalEntriesListQueryDto } from './dto/journal-entries-list-query.dto';
import { JournalLinesListQueryDto } from './dto/journal-lines-list-query.dto';
import { AccountingBalanceQueryDto } from './dto/accounting-balance-query.dto';
import { JournalEntriesService } from './journal-entries.service';

/**
 * Écritures + lignes SYSCOHADA (SYSCO-003 / SYSCO-009 permissions).
 */
@ApiTags('journal-entries')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller()
export class JournalEntriesController {
  constructor(private readonly service: JournalEntriesService) {}

  @RequirePermissions(
    'accounting.journal.read',
    'treasury.accounting_link.read',
  )
  @Get('journal-entries')
  @ApiOperation({
    summary:
      'List journal entries (filter journal / period / account; optional lines)',
  })
  findAll(@Query() query: JournalEntriesListQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions(
    'accounting.journal.read',
    'treasury.accounting_link.read',
  )
  @Get('journal-entries/:id')
  @ApiOperation({ summary: 'Get journal entry with lines' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('accounting.journal.write')
  @Post('journal-entries')
  @ApiOperation({
    summary:
      'Create balanced journal entry (draft or posted). Rejects locked/closed period.',
  })
  create(
    @Body() dto: CreateJournalEntryDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.create(dto, user.id);
  }

  @RequirePermissions(
    'accounting.journal.read',
    'treasury.accounting_link.read',
  )
  @Get('journal-lines')
  @ApiOperation({
    summary:
      'List journal lines (raw ledger / grand livre filters by account, journal, period)',
  })
  findLines(@Query() query: JournalLinesListQueryDto) {
    return this.service.findLines(query);
  }

  @RequirePermissions(
    'accounting.journal.read',
    'accounting.reports.read',
    'treasury.accounting_link.read',
  )
  @Get('accounting-balance')
  @ApiOperation({
    summary:
      'Balance générale (agrégat lignes postées par compte — SYSCO-006)',
  })
  getBalance(@Query() query: AccountingBalanceQueryDto) {
    return this.service.getBalance(query);
  }

  @RequirePermissions(
    'accounting.reports.read',
    'accounting.journal.read',
    'treasury.accounting_link.read',
  )
  @Get('accounting-balance-sheet')
  @ApiOperation({
    summary: 'Bilan MVP classes 1–5 (SYSCO-008)',
  })
  getBalanceSheet(@Query() query: AccountingBalanceQueryDto) {
    return this.service.getFinancialStatement('balance_sheet', query);
  }

  @RequirePermissions(
    'accounting.reports.read',
    'accounting.journal.read',
    'treasury.accounting_link.read',
  )
  @Get('accounting-income-statement')
  @ApiOperation({
    summary: 'Compte de résultat MVP classes 6–7 (SYSCO-008)',
  })
  getIncomeStatement(@Query() query: AccountingBalanceQueryDto) {
    return this.service.getFinancialStatement('income_statement', query);
  }
}
