import { ForbiddenException, Injectable } from '@nestjs/common';
import { BookingGuideAssignmentsService } from '../tour-guides/booking-guide-assignments.service';
import { AssignBookingGuidesDto } from '../tour-guides/dto/booking-guide-assignment.dto';
import { PermissionsService } from '../../rbac/permissions.service';
import { StripeService, BookingCheckoutSessionResult } from '../../stripe/stripe.service';
import { BookingAssistedEmailService } from './booking-assisted-email.service';
import { BookingEngineService } from './booking-engine.service';
import { BookingsService } from './bookings.service';
import { ApproveBookingDto } from './dto/approve-booking.dto';
import { BookingAdminDetailDto } from './dto/booking-admin-detail.dto';
import { RejectBookingDto } from './dto/reject-booking.dto';

@Injectable()
export class BookingApprovalService {
  constructor(
    private readonly bookingEngine: BookingEngineService,
    private readonly bookingsService: BookingsService,
    private readonly permissionsService: PermissionsService,
    private readonly guideAssignmentsService: BookingGuideAssignmentsService,
    private readonly stripeService: StripeService,
    private readonly assistedEmail: BookingAssistedEmailService,
  ) {}

  async approve(
    bookingId: string,
    dto: ApproveBookingDto,
    actorUserId: string,
  ): Promise<BookingAdminDetailDto> {
    await this.assertApprovalAccess(actorUserId);

    await this.bookingEngine.approveAssistedBooking(bookingId, actorUserId, {
      totalCents: dto.totalCents,
      reason: dto.reason,
    });

    if (dto.guides?.length) {
      await this.guideAssignmentsService.assignGuides(
        bookingId,
        { guides: dto.guides } satisfies AssignBookingGuidesDto,
        actorUserId,
      );
    }

    this.assistedEmail.notifyApproved(bookingId);

    return this.bookingsService.getAdminDetail(bookingId);
  }

  async reject(
    bookingId: string,
    dto: RejectBookingDto,
    actorUserId: string,
  ): Promise<BookingAdminDetailDto> {
    await this.assertApprovalAccess(actorUserId);
    await this.bookingEngine.rejectAssistedBooking(bookingId, actorUserId, dto.reason);
    this.assistedEmail.notifyRejected(bookingId, dto.reason);
    return this.bookingsService.getAdminDetail(bookingId);
  }

  async invitePayment(
    bookingId: string,
    actorUserId: string,
  ): Promise<BookingCheckoutSessionResult> {
    await this.assertApprovalAccess(actorUserId);
    const session = await this.stripeService.getOrCreateCheckoutSessionForBooking(
      bookingId,
      actorUserId,
    );
    this.assistedEmail.notifyPaymentInvite(bookingId, session.url);
    return session;
  }

  private async assertApprovalAccess(actorUserId: string): Promise<void> {
    if (await this.permissionsService.hasSuperAdminRole(actorUserId)) {
      return;
    }
    if (await this.permissionsService.hasAnyPermission(actorUserId, ['bookings.approve'])) {
      return;
    }
    const staff = await this.permissionsService.hasAnyPermission(actorUserId, ['users.read']);
    const canWrite = await this.permissionsService.hasAnyPermission(actorUserId, [
      'bookings.write',
    ]);
    if (staff && canWrite) {
      return;
    }
    throw new ForbiddenException(
      'Accès réservé au personnel autorisé (bookings.approve ou bookings.write staff).',
    );
  }
}
