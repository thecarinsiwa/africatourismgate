import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { AccountingJournalsService } from './accounting-journals.service';
import { AccountingJournalsListQueryDto } from './dto/accounting-journals-list-query.dto';

/**
 * Journaux SYSCOHADA (SYSCO-003) — lecture.
 * Bridge : `accounting.journal.read` OU `treasury.accounting_link.read`.
 */
@ApiTags('accounting-journals')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('accounting-journals')
export class AccountingJournalsController {
  constructor(private readonly service: AccountingJournalsService) {}

  @RequirePermissions(
    'accounting.journal.read',
    'treasury.accounting_link.read',
  )
  @Get()
  @ApiOperation({ summary: 'List accounting journals (paginated)' })
  findAll(@Query() query: AccountingJournalsListQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions(
    'accounting.journal.read',
    'treasury.accounting_link.read',
  )
  @Get(':id')
  @ApiOperation({ summary: 'Get accounting journal by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
