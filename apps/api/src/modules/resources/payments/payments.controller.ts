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
import { ApiForbiddenResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DeepPartial } from 'typeorm';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { Payments } from '../../../entities/generated';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { StripeService } from '../../stripe/stripe.service';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly service: PaymentsService,
    private readonly stripeService: StripeService,
  ) {}

  @Get()
  @RequirePermissions('payments.read')
  @ApiOperation({ summary: 'List payments' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('payments.read')
  @ApiOperation({ summary: 'Get payments by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermissions('payments.write')
  @ApiOperation({ summary: 'Create payments' })
  create(@Body() dto: DeepPartial<Payments>) {
    return this.service.create(dto);
  }

  @Post(':id/refund')
  @RequirePermissions('payments.write')
  @ApiOperation({
    summary: 'Refund payment via Stripe (partial or full; booking must be cancelled)',
  })
  refund(
    @Param('id') id: string,
    @Body() dto: RefundPaymentDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.stripeService.createRefundForPayment(id, dto.amountCents, user.id);
  }

  @Patch(':id')
  @RequirePermissions('payments.write')
  @ApiOperation({ summary: 'Update payments' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<Payments>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('payments.delete')
  @ApiOperation({ summary: 'Soft-delete payments' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
