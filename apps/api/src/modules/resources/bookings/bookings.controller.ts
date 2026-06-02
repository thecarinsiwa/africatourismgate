import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiForbiddenResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { PermissionsService } from '../../rbac/permissions.service';
import { StripeService } from '../../stripe/stripe.service';
import { BookingEngineService } from './booking-engine.service';
import { BookingsService } from './bookings.service';
import { BookingCheckoutDto } from './dto/booking-checkout.dto';
import { BookingsListQueryDto } from './dto/bookings-list-query.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { RecordCashPaymentDto } from './dto/record-cash-payment.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { CreateBookingReviewDto } from '../reviews/dto/create-booking-review.dto';

@ApiTags('bookings')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('bookings')
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly bookingEngine: BookingEngineService,
    private readonly stripeService: StripeService,
    private readonly permissionsService: PermissionsService,
  ) {}

  @Post('checkout-preview')
  @RequirePermissions('bookings.write')
  @ApiOperation({ summary: 'Preview booking checkout (stock + pricing)' })
  previewCheckout(
    @Body() dto: BookingCheckoutDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.bookingsService.previewCheckout(dto, user.id);
  }

  @Post()
  @RequirePermissions('bookings.write')
  @ApiOperation({ summary: 'Create booking with room stock allocation' })
  createBooking(
    @Body() dto: BookingCheckoutDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.bookingsService.createFromCheckout(dto, user.id);
  }

  @Get()
  @RequirePermissions('bookings.read')
  @ApiOperation({ summary: 'List bookings' })
  findAll(
    @Query() query: BookingsListQueryDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.bookingsService.list(query, user.id);
  }

  @Get(':id/reviews')
  @RequirePermissions('reviews.read')
  @ApiOperation({ summary: 'Get review for a booking' })
  getReview(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
    return this.bookingsService.getBookingReview(id, user.id);
  }

  @Post(':id/reviews')
  @RequirePermissions('reviews.write')
  @ApiOperation({ summary: 'Submit a post-stay review for a booking' })
  createReview(
    @Param('id') id: string,
    @Body() dto: CreateBookingReviewDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.bookingsService.createBookingReview(id, user.id, dto);
  }

  @Get(':id')
  @RequirePermissions('bookings.read')
  @ApiOperation({ summary: 'Get booking detail with client, items, payments, status history' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthUserDto,
  ) {
    const staff = await this.permissionsService.hasAnyPermission(user.id, [
      'users.read',
    ]);
    if (staff) {
      return this.bookingsService.getAdminDetail(id);
    }
    return this.bookingsService.getCustomerDetail(id, user.id);
  }

  @Patch(':id/status')
  @RequirePermissions('bookings.write')
  @ApiOperation({ summary: 'Change booking status (records history)' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateBookingStatusDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.bookingsService.updateStatus(id, dto, user.id);
  }

  @Post(':id/cash-payment')
  @RequirePermissions('bookings.write')
  @ApiOperation({ summary: 'Record cash payment and confirm booking (POS)' })
  async recordCashPayment(
    @Param('id') id: string,
    @Body() dto: RecordCashPaymentDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    await this.bookingsService.assertBookingOwnerOrStaff(id, user.id);
    return this.bookingEngine.recordCashPayment(id, user.id, dto.note);
  }

  @Post(':id/payment-intent')
  @RequirePermissions('bookings.write')
  @ApiOperation({ summary: 'Create Stripe PaymentIntent for booking (test / custom UI)' })
  async createPaymentIntent(
    @Param('id') id: string,
    @CurrentUser() user: AuthUserDto,
  ) {
    await this.bookingsService.assertBookingOwnerOrStaff(id, user.id);
    return this.stripeService.createPaymentIntentForBooking(id, user.id);
  }

  @Post(':id/checkout-session')
  @RequirePermissions('bookings.write')
  @ApiOperation({ summary: 'Create Stripe Checkout Session (hosted payment page)' })
  async createCheckoutSession(
    @Param('id') id: string,
    @CurrentUser() user: AuthUserDto,
  ) {
    await this.bookingsService.assertBookingOwnerOrStaff(id, user.id);
    return this.stripeService.createCheckoutSessionForBooking(id, user.id);
  }

  @Post(':id/confirm')
  @RequirePermissions('bookings.write')
  @ApiOperation({ summary: 'Confirm booking (pending_payment → confirmed)' })
  async confirm(
    @Param('id') id: string,
    @CurrentUser() user: AuthUserDto,
  ) {
    await this.bookingsService.assertBookingOwnerOrStaff(id, user.id);
    return this.bookingEngine.confirmBooking(id, user.id);
  }

  @Post(':id/cancel')
  @RequirePermissions('bookings.write')
  @ApiOperation({ summary: 'Cancel booking, restore stock, optional reason' })
  cancel(
    @Param('id') id: string,
    @Body() dto: CancelBookingDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.bookingsService.cancelWithReason(id, dto.reason, user.id);
  }
}
