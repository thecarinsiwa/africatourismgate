import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Bookings } from '../../../entities/generated';
import { BookingGuideAssignmentsService } from '../tour-guides/booking-guide-assignments.service';
import { AssignBookingGuidesDto } from '../tour-guides/dto/booking-guide-assignment.dto';
import { PermissionsService } from '../../rbac/permissions.service';
import { StripeService, BookingCheckoutSessionResult } from '../../stripe/stripe.service';
import { BookingAssistedEmailService } from './booking-assisted-email.service';
import { BookingEngineService } from './booking-engine.service';
import { BookingManifestService } from './booking-manifest.service';
import { BookingsService } from './bookings.service';
import { ApproveBookingDto } from './dto/approve-booking.dto';
import { BookingAdminDetailDto } from './dto/booking-admin-detail.dto';
import { RejectBookingDto } from './dto/reject-booking.dto';
import { UpdateBookingPricingDto } from './dto/update-booking-pricing.dto';
import { UpdateBookingVisitDatesDto } from './dto/update-booking-visit-dates.dto';

@Injectable()
export class BookingApprovalService {
  constructor(
    private readonly bookingEngine: BookingEngineService,
    private readonly bookingsService: BookingsService,
    private readonly manifestService: BookingManifestService,
    private readonly permissionsService: PermissionsService,
    private readonly guideAssignmentsService: BookingGuideAssignmentsService,
    private readonly stripeService: StripeService,
    private readonly assistedEmail: BookingAssistedEmailService,
    @InjectRepository(Bookings)
    private readonly bookingsRepository: Repository<Bookings>,
  ) {}

  async approve(
    bookingId: string,
    dto: ApproveBookingDto,
    actorUserId: string,
  ): Promise<BookingAdminDetailDto> {
    await this.assertApprovalAccess(actorUserId);

    const finalTotalCents = await this.resolveFinalTotalCents(
      bookingId,
      dto.travelers,
      dto.totalCents,
      actorUserId,
    );

    if (dto.visitStartDate) {
      const visitStartDate = dto.visitStartDate.slice(0, 10);
      const visitEndDate = dto.visitEndDate?.slice(0, 10);
      await this.bookingEngine.updateVisitDates(bookingId, actorUserId, {
        startDate: visitStartDate,
        endDate: visitEndDate,
      });
    }

    await this.bookingEngine.approveAssistedBooking(bookingId, actorUserId, {
      totalCents: finalTotalCents,
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

  async updatePricing(
    bookingId: string,
    dto: UpdateBookingPricingDto,
    actorUserId: string,
  ): Promise<BookingAdminDetailDto> {
    await this.assertApprovalAccess(actorUserId);

    const booking = await this.bookingsRepository.findOne({
      where: { id: bookingId, deletedAt: IsNull() },
    });
    if (!booking) {
      throw new BadRequestException('Réservation introuvable.');
    }
    if (booking.status !== 'pending_payment') {
      throw new BadRequestException(
        'La tarification ne peut être modifiée que pour une réservation en attente de paiement.',
      );
    }

    const entries = await this.manifestService.upsertTravelerPricing(
      bookingId,
      dto.travelers,
      actorUserId,
    );
    const sumTravelerCents = this.manifestService.sumTravelerPrices(entries);
    const finalTotalCents = dto.totalCents ?? sumTravelerCents;

    if (finalTotalCents < 1) {
      throw new BadRequestException('Montant de réservation invalide.');
    }

    booking.totalCents = finalTotalCents;
    booking.updatedByUserId = actorUserId;
    await this.bookingsRepository.save(booking);

    return this.bookingsService.getAdminDetail(bookingId);
  }

  async updateVisitDates(
    bookingId: string,
    dto: UpdateBookingVisitDatesDto,
    actorUserId: string,
  ): Promise<BookingAdminDetailDto> {
    await this.assertApprovalAccess(actorUserId);
    await this.bookingEngine.updateVisitDates(bookingId, actorUserId, {
      startDate: dto.startDate,
      endDate: dto.endDate,
    });
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

  private async resolveFinalTotalCents(
    bookingId: string,
    travelers: ApproveBookingDto['travelers'],
    totalCentsOverride: number | undefined,
    actorUserId: string,
  ): Promise<number> {
    let sumTravelerCents: number | undefined;

    if (travelers?.length) {
      const entries = await this.manifestService.upsertTravelerPricing(
        bookingId,
        travelers,
        actorUserId,
      );
      sumTravelerCents = this.manifestService.sumTravelerPrices(entries);
    } else {
      const entries = await this.manifestService.listForBooking(bookingId);
      const priced = entries.filter((entry) => entry.priceCents != null);
      if (priced.length > 0) {
        sumTravelerCents = this.manifestService.sumTravelerPrices(priced);
      }
    }

    const booking = await this.bookingsRepository.findOne({
      where: { id: bookingId, deletedAt: IsNull() },
    });
    if (!booking) {
      throw new BadRequestException('Réservation introuvable.');
    }

    const finalTotalCents = totalCentsOverride ?? sumTravelerCents ?? booking.totalCents;
    if (finalTotalCents < 1) {
      throw new BadRequestException('Montant de réservation invalide.');
    }
    return finalTotalCents;
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
