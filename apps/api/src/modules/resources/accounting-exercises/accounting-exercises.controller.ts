import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { AccountingExercisesService } from './accounting-exercises.service';
import { AccountingExercisesListQueryDto } from './dto/accounting-exercises-list-query.dto';
import { AccountingPeriodsListQueryDto } from './dto/accounting-periods-list-query.dto';

/**
 * Exercices / périodes SYSCOHADA (SYSCO-002) — lecture.
 * Permission bridge : `treasury.accounting_link.read` (→ `accounting.*` en SYSCO-009).
 */
@ApiTags('accounting-exercises')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller()
export class AccountingExercisesController {
  constructor(private readonly service: AccountingExercisesService) {}

  @RequirePermissions('treasury.accounting_link.read')
  @Get('accounting-exercises')
  @ApiOperation({
    summary: 'List accounting exercises (paginated; optional periods)',
  })
  findAllExercises(@Query() query: AccountingExercisesListQueryDto) {
    return this.service.findAllExercises(query);
  }

  @RequirePermissions('treasury.accounting_link.read')
  @Get('accounting-exercises/:id')
  @ApiOperation({ summary: 'Get accounting exercise by id (includes periods)' })
  findOneExercise(@Param('id') id: string) {
    return this.service.findOneExercise(id);
  }

  @RequirePermissions('treasury.accounting_link.read')
  @Get('accounting-periods')
  @ApiOperation({ summary: 'List accounting periods (paginated)' })
  findAllPeriods(@Query() query: AccountingPeriodsListQueryDto) {
    return this.service.findAllPeriods(query);
  }

  @RequirePermissions('treasury.accounting_link.read')
  @Get('accounting-periods/:id')
  @ApiOperation({ summary: 'Get accounting period by id' })
  findOnePeriod(@Param('id') id: string) {
    return this.service.findOnePeriod(id);
  }
}
