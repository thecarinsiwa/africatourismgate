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
import { AccountingExercisesService } from './accounting-exercises.service';
import { CreateAccountingExerciseDto } from './dto/create-accounting-exercise.dto';
import { UpdateAccountingExerciseDto } from './dto/update-accounting-exercise.dto';
import { AccountingExercisesListQueryDto } from './dto/accounting-exercises-list-query.dto';
import { AccountingPeriodsListQueryDto } from './dto/accounting-periods-list-query.dto';

/**
 * Exercices / périodes SYSCOHADA (SYSCO-002 lecture + create/patch + SYSCO-008 clôture).
 */
@ApiTags('accounting-exercises')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller()
export class AccountingExercisesController {
  constructor(private readonly service: AccountingExercisesService) {}

  @RequirePermissions('accounting.read', 'treasury.accounting_link.read')
  @Get('accounting-exercises')
  @ApiOperation({
    summary: 'List accounting exercises (paginated; optional periods)',
  })
  findAllExercises(@Query() query: AccountingExercisesListQueryDto) {
    return this.service.findAllExercises(query);
  }

  @RequirePermissions('accounting.read', 'treasury.accounting_link.read')
  @Get('accounting-exercises/:id')
  @ApiOperation({ summary: 'Get accounting exercise by id (includes periods)' })
  findOneExercise(@Param('id') id: string) {
    return this.service.findOneExercise(id);
  }

  @RequirePermissions('accounting.chart.write')
  @Post('accounting-exercises')
  @ApiOperation({
    summary:
      'Create accounting exercise with monthly periods (currency defaults to org)',
  })
  createExercise(
    @Body() dto: CreateAccountingExerciseDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.createFromDto(dto, user.id);
  }

  @RequirePermissions('accounting.chart.write')
  @Patch('accounting-exercises/:id')
  @ApiOperation({
    summary:
      'Update exercise label; currency only if open and no posted entries',
  })
  updateExercise(
    @Param('id') id: string,
    @Body() dto: UpdateAccountingExerciseDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.updateFromDto(id, dto, user.id);
  }

  @RequirePermissions('accounting.close')
  @Post('accounting-exercises/:id/close')
  @ApiOperation({
    summary:
      'Close exercise (OD closing entry + lock/close periods) — SYSCO-008',
  })
  closeExercise(
    @Param('id') id: string,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.closeExercise(id, user.id);
  }

  @RequirePermissions('accounting.read', 'treasury.accounting_link.read')
  @Get('accounting-periods')
  @ApiOperation({ summary: 'List accounting periods (paginated)' })
  findAllPeriods(@Query() query: AccountingPeriodsListQueryDto) {
    return this.service.findAllPeriods(query);
  }

  @RequirePermissions('accounting.read', 'treasury.accounting_link.read')
  @Get('accounting-periods/:id')
  @ApiOperation({ summary: 'Get accounting period by id' })
  findOnePeriod(@Param('id') id: string) {
    return this.service.findOnePeriod(id);
  }

  @RequirePermissions('accounting.close')
  @Post('accounting-periods/:id/lock')
  @ApiOperation({ summary: 'Lock accounting period (no new postings)' })
  lockPeriod(
    @Param('id') id: string,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.lockPeriod(id, user.id);
  }

  @RequirePermissions('accounting.close')
  @Post('accounting-periods/:id/unlock')
  @ApiOperation({ summary: 'Unlock accounting period' })
  unlockPeriod(
    @Param('id') id: string,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.unlockPeriod(id, user.id);
  }
}
