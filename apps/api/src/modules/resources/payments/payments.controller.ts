import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiForbiddenResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { PaymentAdminDetailDto } from './dto/payment-admin-detail.dto';
import { PaymentListItemDto } from './dto/payment-list-item.dto';
import { PaymentsListQueryDto } from './dto/payments-list-query.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @RequirePermissions('payments.read')
  @Get()
  @ApiOperation({ summary: 'List payments (admin)' })
  findAll(@Query() query: PaymentsListQueryDto) {
    return this.service.list(query);
  }

  @RequirePermissions('payments.write')
  @Post(':id/refund')
  @ApiOperation({ summary: 'Refund a Stripe payment' })
  refund(
    @Param('id') id: string,
    @Body() dto: RefundPaymentDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.refund(id, dto.amountCents, user.id);
  }

  @RequirePermissions('payments.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get payment detail (admin)' })
  findOne(@Param('id') id: string): Promise<PaymentAdminDetailDto> {
    return this.service.getAdminDetail(id);
  }
}
