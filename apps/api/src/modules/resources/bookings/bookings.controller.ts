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
import { BookingEngineService } from './booking-engine.service';
import { BookingsService } from './bookings.service';
import { BookingCheckoutDto } from './dto/booking-checkout.dto';
import { BookingsListQueryDto } from './dto/bookings-list-query.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';

@ApiTags('bookings')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('bookings')
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly bookingEngine: BookingEngineService,
  ) {}

  @Post('checkout-preview')
  @RequirePermissions('bookings.write')
  @ApiOperation({ summary: 'Preview booking checkout (stock + pricing)' })
  previewCheckout(
    @Body() dto: BookingCheckoutDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.bookingEngine.previewCheckout(dto, user.id);
  }

  @Post()
  @RequirePermissions('bookings.write')
  @ApiOperation({ summary: 'Create booking with room stock allocation' })
  createBooking(
    @Body() dto: BookingCheckoutDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.bookingEngine.createBooking(dto, user.id, user.id);
  }

  @Get()
  @RequirePermissions('bookings.read')
  @ApiOperation({ summary: 'List bookings' })
  findAll(@Query() query: BookingsListQueryDto) {
    return this.bookingsService.list(query);
  }

  @Get(':id')
  @RequirePermissions('bookings.read')
  @ApiOperation({ summary: 'Get booking detail with client, items, payments, status history' })
  findOne(@Param('id') id: string) {
    return this.bookingsService.getAdminDetail(id);
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

  @Post(':id/confirm')
  @RequirePermissions('bookings.write')
  @ApiOperation({ summary: 'Confirm booking (pending_payment → confirmed)' })
  confirm(
    @Param('id') id: string,
    @CurrentUser() user: AuthUserDto,
  ) {
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
