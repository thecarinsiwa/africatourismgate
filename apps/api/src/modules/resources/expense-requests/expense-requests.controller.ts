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
import { CreateExpenseRequestDto } from './dto/create-expense-request.dto';
import { ExpenseRequestsListQueryDto } from './dto/expense-requests-list-query.dto';
import { TransitionExpenseRequestDto } from './dto/transition-expense-request.dto';
import { UpdateExpenseRequestDto } from './dto/update-expense-request.dto';
import { ExpenseRequestsService } from './expense-requests.service';

@ApiTags('expense-requests')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('expense-requests')
export class ExpenseRequestsController {
  constructor(private readonly service: ExpenseRequestsService) {}

  @RequirePermissions('treasury.read')
  @Get()
  @ApiOperation({ summary: 'List expense requests (paginated, filtered)' })
  findAll(@Query() query: ExpenseRequestsListQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('treasury.read')
  @Get(':id/status-history')
  @ApiOperation({ summary: 'List status history for an expense request' })
  listStatusHistory(@Param('id') id: string) {
    return this.service.listStatusHistory(id);
  }

  @RequirePermissions('treasury.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get expense request by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('treasury.expense_requests.create')
  @Post()
  @ApiOperation({ summary: 'Create expense request (status = draft)' })
  create(
    @Body() dto: CreateExpenseRequestDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.createFromDto(dto, user.id);
  }

  @RequirePermissions(
    'treasury.expense_requests.create',
    'treasury.expense_requests.validate',
    'treasury.expense_requests.authorize',
    'treasury.exits.write',
  )
  @Post(':id/transition')
  @ApiOperation({
    summary:
      'Transition expense request status (state machine + immutable history)',
  })
  transition(
    @Param('id') id: string,
    @Body() dto: TransitionExpenseRequestDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.transition(id, dto, user.id);
  }

  @RequirePermissions('treasury.expense_requests.create')
  @Patch(':id')
  @ApiOperation({
    summary: 'Update draft expense request (fields only; transitions = TRESO-022)',
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateExpenseRequestDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.updateFromDto(id, dto, user.id);
  }

  @RequirePermissions('treasury.expense_requests.create')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete draft expense request' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
    return this.service.remove(id, user.id);
  }
}
