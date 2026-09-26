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
import { BudgetsService } from './budgets.service';
import { BudgetsListQueryDto } from './dto/budgets-list-query.dto';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@ApiTags('budgets')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly service: BudgetsService) {}

  @RequirePermissions('treasury.read')
  @Get()
  @ApiOperation({
    summary: 'List budgets (paginated; filter by year / period / currency)',
  })
  findAll(@Query() query: BudgetsListQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('treasury.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get budget by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('treasury.budgets.write')
  @Post()
  @ApiOperation({
    summary:
      'Create monthly or annual general budget (activity/product → TRESO-024)',
  })
  create(@Body() dto: CreateBudgetDto, @CurrentUser() user: AuthUserDto) {
    return this.service.createFromDto(dto, user.id);
  }

  @RequirePermissions('treasury.budgets.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update budget' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBudgetDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.updateFromDto(id, dto, user.id);
  }

  @RequirePermissions('treasury.budgets.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete budget' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
    return this.service.remove(id, user.id);
  }
}
