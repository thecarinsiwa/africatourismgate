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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DeepPartial } from 'typeorm';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { StripeService } from '../../stripe/stripe.service';
import { Payments } from '../../../entities/generated';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { PaymentsListQueryDto } from './dto/payments-list-query.dto';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly service: PaymentsService,
    private readonly stripeService: StripeService,
  ) {}

  @Get()
  @RequirePermissions('payments.read')
  @ApiOperation({ summary: 'List payments (admin)' })
  findAll(@Query() query: PaymentsListQueryDto, @CurrentUser() user: AuthUserDto) {
    return this.service.list(query, user.id);
  }

  @Post(':id/refund')
  @RequirePermissions('payments.write', 'payments.refund')
  @ApiOperation({ summary: 'Refund a Stripe payment' })
  refund(
    @Param('id') id: string,
    @Body() dto: RefundPaymentDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.stripeService.createRefundForPayment(id, dto.amountCents, user.id);
  }

  @Get(':id')
  @RequirePermissions('payments.read')
  @ApiOperation({ summary: 'Get payment detail (admin)' })
  findOne(@Param('id') id: string) {
    return this.service.getAdminDetail(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create payments' })
  create(@Body() dto: DeepPartial<Payments>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update payments' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<Payments>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete payments' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
