import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { ChartOfAccountsService } from './chart-of-accounts.service';
import { ChartAccountsListQueryDto } from './dto/chart-accounts-list-query.dto';

/**
 * Plan comptable SYSCOHADA (SYSCO-002) — lecture.
 * Permission bridge temporaire : `treasury.accounting_link.read`
 * (remplacée / complétée par `accounting.chart.read` en SYSCO-009).
 */
@ApiTags('chart-of-accounts')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('chart-of-accounts')
export class ChartOfAccountsController {
  constructor(private readonly service: ChartOfAccountsService) {}

  @RequirePermissions('treasury.accounting_link.read')
  @Get()
  @ApiOperation({
    summary: 'List chart of accounts (SYSCOHADA, paginated)',
  })
  findAll(@Query() query: ChartAccountsListQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('treasury.accounting_link.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get chart account by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
