import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, EntityManager, IsNull, Repository } from 'typeorm';
import { newId } from '../../../common/utils/uuid';
import {
  Activities,
  ActivitySchedules,
  BookingItems,
  Bookings,
  Payments,
  CabinAvailability,
  Cabins,
  FlightClassAvailability,
  FlightClasses,
  Flights,
  Properties,
  RoomAvailability,
  Rooms,
  VehicleAvailability,
  Users,
  Vehicles,
} from '../../../entities/generated';
import { resolveCheckoutBookingMode } from '@africatourismgate/types';
import { OrgScopeService } from '../../../common/org-scope/org-scope.service';
import { toAuthUserDto } from '../../auth/dto/auth-user.dto';
import { EmailService } from '../../email/email.service';
import { EmailVerificationService } from '../../email-verification/email-verification.service';
import {
  assertValidVehicleDates,
  countRentalDays,
  slotCoversRentalPeriod,
} from '../../public/vehicles/vehicle-dates.util';
import { enumerateDates, addDaysToDateOnly, visitSpanDays } from '../room-availability/room-availability-date.util';
import { OrganizationSettingsService } from '../organization-settings/organization-settings.service';
import { PackagesService } from '../packages/packages.service';
import {
  BookingCheckoutDto,
  BookingCheckoutItemDto,
} from './dto/booking-checkout.dto';
import {
  BookingCheckoutLineDto,
  BookingCheckoutPreviewResponseDto,
} from './dto/booking-checkout-preview-response.dto';
import type { CreateBookingResponseDto } from './dto/create-booking-response.dto';
import { BookingDetailDto } from './dto/booking-detail.dto';
import {
  BOOKING_REQUEST_REGISTERED_MESSAGE,
  BookingRequestResponseDto,
} from './dto/booking-request-response.dto';
import { BookingCheckoutPromoService } from './booking-checkout-promo.service';
import { BookingPackageCheckoutService } from './booking-package-checkout.service';
import { BookingStatusHistoryService } from './booking-status-history.service';
import type { PackageResolvedLineDto } from '../../public/packages/dto/package-resolved-line.dto';
import type { AppliedCheckoutDiscountDto } from './dto/booking-checkout-preview-response.dto';
import type { AppliedPackageCheckoutDiscountDto } from './dto/booking-checkout-preview-response.dto';

type StockTarget =
  | { kind: 'room'; roomId: string; date: string }
  | { kind: 'flight_class'; flightClassId: string; date: string }
  | { kind: 'vehicle'; availabilityId: string }
  | { kind: 'cabin'; availabilityId: string }
  | { kind: 'activity_schedule'; scheduleId: string };

type ResolvedBookingLine = BookingCheckoutLineDto & { stock?: StockTarget };

@Injectable()
export class BookingEngineService {
  constructor(
    @InjectRepository(Bookings)
    private readonly bookingsRepository: Repository<Bookings>,
    @InjectRepository(Payments)
    private readonly paymentsRepository: Repository<Payments>,
    @InjectRepository(BookingItems)
    private readonly bookingItemsRepository: Repository<BookingItems>,
    @InjectRepository(RoomAvailability)
    private readonly roomAvailabilityRepository: Repository<RoomAvailability>,
    @InjectRepository(Rooms)
    private readonly roomsRepository: Repository<Rooms>,
    @InjectRepository(FlightClassAvailability)
    private readonly flightAvailabilityRepository: Repository<FlightClassAvailability>,
    @InjectRepository(FlightClasses)
    private readonly flightClassesRepository: Repository<FlightClasses>,
    @InjectRepository(VehicleAvailability)
    private readonly vehicleAvailabilityRepository: Repository<VehicleAvailability>,
    @InjectRepository(Vehicles)
    private readonly vehiclesRepository: Repository<Vehicles>,
    @InjectRepository(CabinAvailability)
    private readonly cabinAvailabilityRepository: Repository<CabinAvailability>,
    @InjectRepository(Cabins)
    private readonly cabinsRepository: Repository<Cabins>,
    @InjectRepository(ActivitySchedules)
    private readonly activitySchedulesRepository: Repository<ActivitySchedules>,
    @InjectRepository(Activities)
    private readonly activitiesRepository: Repository<Activities>,
    @InjectRepository(Properties)
    private readonly propertiesRepository: Repository<Properties>,
    @InjectRepository(Flights)
    private readonly flightsRepository: Repository<Flights>,
    private readonly statusHistory: BookingStatusHistoryService,
    private readonly checkoutPromo: BookingCheckoutPromoService,
    private readonly packageCheckout: BookingPackageCheckoutService,
    private readonly packagesService: PackagesService,
    private readonly orgScopeService: OrgScopeService,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    private readonly emailService: EmailService,
    private readonly emailVerification: EmailVerificationService,
    private readonly organizationSettingsService: OrganizationSettingsService,
  ) {}

  async previewCheckout(
    dto: BookingCheckoutDto,
    userId: string,
  ): Promise<BookingCheckoutPreviewResponseDto> {
    await this.assertCheckoutOrganizationScope(dto, userId);
    const pricing = await this.resolveCheckoutPricing(dto);
    const modes = await this.organizationSettingsService.getResolvedItemTypeModes();
    const bookingMode = resolveCheckoutBookingMode({
      packageId: dto.packageId,
      itemTypes: dto.items.map((item) => item.itemType),
      modes,
    });
    return {
      lines: pricing.lines.map(({ stock: _s, ...rest }) => rest),
      subtotalCents: pricing.subtotalCents,
      packageDiscountCents: pricing.packageDiscountCents,
      discountCents: pricing.discountCents,
      totalCents: pricing.totalCents,
      currency: pricing.currency,
      appliedPackageDiscount: pricing.appliedPackageDiscount,
      appliedDiscount: pricing.appliedDiscount,
      bookingMode,
    };
  }

  async createBooking(
    dto: BookingCheckoutDto,
    userId: string,
    actorUserId?: string,
  ): Promise<CreateBookingResponseDto> {
    this.assertPreferredPaymentMethod(dto);
    await this.assertCheckoutOrganizationScope(dto, actorUserId ?? userId);
    const pricing = await this.resolveCheckoutPricing(dto);

    const bookingId = await this.bookingsRepository.manager.transaction(
      async (manager) => {
        await this.allocateStock(manager, pricing.lines, 'decrement', actorUserId);

        const bookingsRepo = manager.getRepository(Bookings);
        const itemsRepo = manager.getRepository(BookingItems);
        const id = newId();

        const booking = bookingsRepo.create({
          id,
          userId,
          status: 'draft',
          totalCents: pricing.totalCents,
          currency: pricing.currency,
          promoCodeId: pricing.discount?.promoCodeId ?? null,
          promotionId: pricing.discount?.promotionId ?? null,
          preferredPaymentMethod: dto.preferredPaymentMethod!,
          createdByUserId: actorUserId ?? null,
        } as Bookings);
        await bookingsRepo.save(booking);

        for (const line of pricing.lines) {
          const item = itemsRepo.create({
            id: newId(),
            bookingId: id,
            itemType: line.itemType,
            referenceId: line.referenceId,
            titleSnapshot: line.titleSnapshot,
            quantity: line.quantity,
            unitPriceCents: line.unitPriceCents,
            startDate: line.startDate,
            endDate: line.endDate,
            createdByUserId: actorUserId ?? null,
          } as BookingItems);
          await itemsRepo.save(item);
        }

        if (pricing.discount) {
          await this.checkoutPromo.recordRedemption(manager, pricing.discount);
        }

        return id;
      },
    );

    await this.statusHistory.record({
      bookingId,
      fromStatus: null,
      toStatus: 'draft',
      reason: 'Création de la réservation (en attente de vérification)',
      changedByUserId: actorUserId ?? null,
    });

    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });
    const detail = await this.getBookingDetail(bookingId);
    const { verificationId } = await this.emailVerification.createAndSend({
      email: user?.email ?? '',
      purpose: 'booking',
      referenceId: bookingId,
      firstName: user?.firstName ?? 'Client',
      metadata: {
        totalCents: pricing.totalCents,
        currency: pricing.currency,
      },
    });

    return {
      ...detail,
      requiresVerification: true,
      verificationId,
    };
  }

  async activateDraftBooking(bookingId: string): Promise<BookingDetailDto> {
    const booking = await this.findBookingOrThrow(bookingId);
    if (booking.status !== 'draft') {
      throw new BadRequestException(
        `La réservation n'est pas en attente de vérification (statut « ${booking.status} »).`,
      );
    }
    const fromStatus = booking.status;
    booking.status = 'pending_payment';
    booking.updatedByUserId = null;
    await this.bookingsRepository.save(booking);
    await this.statusHistory.record({
      bookingId,
      fromStatus,
      toStatus: 'pending_payment',
      reason: 'Vérification e-mail confirmée',
      changedByUserId: null,
    });
    return this.getBookingDetail(bookingId);
  }

  async createBookingRequest(
    dto: BookingCheckoutDto,
    userId: string,
    actorUserId?: string,
  ): Promise<BookingRequestResponseDto> {
    this.assertPreferredPaymentMethod(dto);
    await this.assertCheckoutOrganizationScope(dto, actorUserId ?? userId);
    const pricing = await this.resolveCheckoutPricing(dto);

    const bookingId = await this.bookingsRepository.manager.transaction(
      async (manager) => {
        const bookingsRepo = manager.getRepository(Bookings);
        const itemsRepo = manager.getRepository(BookingItems);
        const id = newId();

        const booking = bookingsRepo.create({
          id,
          userId,
          status: 'pending_approval',
          totalCents: pricing.totalCents,
          currency: pricing.currency,
          promoCodeId: pricing.discount?.promoCodeId ?? null,
          promotionId: pricing.discount?.promotionId ?? null,
          preferredPaymentMethod: dto.preferredPaymentMethod!,
          createdByUserId: actorUserId ?? null,
        } as Bookings);
        await bookingsRepo.save(booking);

        for (const line of pricing.lines) {
          const item = itemsRepo.create({
            id: newId(),
            bookingId: id,
            itemType: line.itemType,
            referenceId: line.referenceId,
            titleSnapshot: line.titleSnapshot,
            quantity: line.quantity,
            unitPriceCents: line.unitPriceCents,
            startDate: line.startDate,
            endDate: line.endDate,
            createdByUserId: actorUserId ?? null,
          } as BookingItems);
          await itemsRepo.save(item);
        }

        return id;
      },
    );

    await this.statusHistory.record({
      bookingId,
      fromStatus: null,
      toStatus: 'pending_approval',
      reason: 'Demande de réservation assistée',
      changedByUserId: actorUserId ?? null,
    });

    return {
      bookingId,
      status: 'pending_approval',
      message: BOOKING_REQUEST_REGISTERED_MESSAGE,
      totalCents: pricing.totalCents,
      currency: pricing.currency,
    };
  }

  async approveAssistedBooking(
    id: string,
    actorUserId: string,
    options?: { totalCents?: number; reason?: string },
  ): Promise<BookingDetailDto> {
    const booking = await this.findBookingOrThrow(id);
    if (booking.status !== 'pending_approval') {
      throw new BadRequestException(
        `Approbation impossible : statut actuel « ${booking.status} » (attendu : pending_approval).`,
      );
    }

    const fromStatus = booking.status;
    const nextTotalCents =
      options?.totalCents !== undefined
        ? Math.max(0, Math.floor(options.totalCents))
        : booking.totalCents;

    if (nextTotalCents < 1) {
      throw new BadRequestException('Montant de réservation invalide.');
    }

    await this.bookingsRepository.manager.transaction(async (manager) => {
      const itemsRepo = manager.getRepository(BookingItems);
      let items = await itemsRepo.find({
        where: { bookingId: id },
      });

      items = await this.expandPackageBookingItems(manager, items, actorUserId);

      const lines = await this.bookingItemsToResolvedLines(manager, items);
      if (lines.length > 0) {
        await this.allocateStock(manager, lines, 'decrement', actorUserId);
      }

      await this.checkoutPromo.recordRedemptionFromBooking(manager, booking);

      const bookingsRepo = manager.getRepository(Bookings);
      const row = await bookingsRepo.findOne({ where: { id } });
      if (!row) {
        throw new NotFoundException('Réservation introuvable.');
      }
      row.status = 'pending_payment';
      row.totalCents = nextTotalCents;
      row.updatedByUserId = actorUserId;
      await bookingsRepo.save(row);
    });

    await this.statusHistory.record({
      bookingId: id,
      fromStatus,
      toStatus: 'pending_payment',
      reason: options?.reason?.trim() || 'Approbation — en attente de paiement',
      changedByUserId: actorUserId,
    });

    return this.getBookingDetail(id);
  }

  async rejectAssistedBooking(
    id: string,
    actorUserId: string,
    reason?: string,
  ): Promise<BookingDetailDto> {
    const booking = await this.findBookingOrThrow(id);
    if (booking.status !== 'pending_approval') {
      throw new BadRequestException(
        `Refus impossible : statut actuel « ${booking.status} » (attendu : pending_approval).`,
      );
    }

    const rejectReason = reason?.trim()
      ? `Refus : ${reason.trim()}`
      : 'Refus de la demande de réservation';

    return this.cancelBooking(id, actorUserId, rejectReason);
  }

  async updateVisitDates(
    bookingId: string,
    actorUserId: string,
    options: { startDate: string; endDate?: string },
  ): Promise<void> {
    const booking = await this.findBookingOrThrow(bookingId);
    if (
      booking.status !== 'pending_approval' &&
      booking.status !== 'pending_payment'
    ) {
      throw new BadRequestException(
        'Les dates de visite ne peuvent être modifiées que pour une réservation en attente de validation ou de paiement.',
      );
    }

    const startDate = options.startDate;
    let endDate = options.endDate;

    await this.bookingsRepository.manager.transaction(async (manager) => {
      const itemsRepo = manager.getRepository(BookingItems);
      const items = await itemsRepo.find({ where: { bookingId } });
      const active = items.filter((item) => !item.deletedAt);
      const datedItems = active
        .filter((item) => item.startDate != null)
        .sort((left, right) => left.startDate!.localeCompare(right.startDate!));

      if (datedItems.length === 0) {
        throw new BadRequestException('Aucune ligne de réservation avec dates à modifier.');
      }

      if (!endDate) {
        const originalStart = datedItems[0]!.startDate!;
        const lastItem = datedItems[datedItems.length - 1]!;
        const originalEnd = lastItem.endDate ?? lastItem.startDate!;
        const spanDays = visitSpanDays(originalStart, originalEnd);
        endDate = addDaysToDateOnly(startDate, spanDays);
      }

      const newDates = enumerateDates(startDate, endDate);

      if (booking.status === 'pending_payment') {
        const lines = await this.bookingItemsToResolvedLines(manager, items);
        if (lines.length > 0) {
          await this.allocateStock(manager, lines, 'restore', actorUserId);
        }
      }

      if (datedItems.length === 1) {
        const item = datedItems[0]!;
        item.startDate = startDate;
        item.endDate = endDate;
        item.updatedByUserId = actorUserId;
        await itemsRepo.save(item);
      } else {
        if (datedItems.length !== newDates.length) {
          throw new BadRequestException(
            `La période doit couvrir ${datedItems.length} nuit(s) (actuellement ${newDates.length}).`,
          );
        }
        for (let index = 0; index < datedItems.length; index++) {
          const item = datedItems[index]!;
          item.startDate = newDates[index]!;
          item.endDate = newDates[index]!;
          item.updatedByUserId = actorUserId;
          await itemsRepo.save(item);
        }
      }

      if (booking.status === 'pending_payment') {
        const refreshedItems = await itemsRepo.find({ where: { bookingId } });
        const lines = await this.bookingItemsToResolvedLines(manager, refreshedItems);
        if (lines.length > 0) {
          await this.allocateStock(manager, lines, 'decrement', actorUserId);
        }
      }

      const bookingsRepo = manager.getRepository(Bookings);
      const row = await bookingsRepo.findOne({ where: { id: bookingId } });
      if (row) {
        row.updatedByUserId = actorUserId;
        await bookingsRepo.save(row);
      }
    });
  }

  async confirmBooking(
    id: string,
    actorUserId?: string,
    reason?: string,
  ): Promise<BookingDetailDto> {
    const booking = await this.findBookingOrThrow(id);
    if (booking.status !== 'pending_payment') {
      throw new BadRequestException(
        `Impossible de confirmer une réservation au statut « ${booking.status} ».`,
      );
    }
    const fromStatus = booking.status;
    booking.status = 'confirmed';
    booking.updatedByUserId = actorUserId ?? null;
    await this.bookingsRepository.save(booking);
    await this.statusHistory.record({
      bookingId: id,
      fromStatus,
      toStatus: 'confirmed',
      reason: reason?.trim() || 'Confirmation',
      changedByUserId: actorUserId ?? null,
    });
    void this.notifyBookingConfirmed(id).catch(() => undefined);
    return this.getBookingDetail(id);
  }

  private async notifyBookingConfirmed(bookingId: string): Promise<void> {
    const detail = await this.getBookingDetail(bookingId);
    const user = await this.usersRepository.findOne({
      where: { id: detail.booking.userId, deletedAt: IsNull() },
    });
    if (!user?.email) {
      return;
    }

    const itemTitles = detail.items
      .map((item) => item.titleSnapshot?.trim())
      .filter((title): title is string => Boolean(title));

    const confirmedAt = detail.booking.updatedAt ?? detail.booking.createdAt;
    await this.emailService.sendBookingConfirmation({
      to: user.email,
      firstName: user.firstName,
      bookingId: detail.booking.id,
      totalCents: detail.totalCents,
      currency: detail.currency,
      itemTitles,
      confirmedAt: confirmedAt.toISOString(),
      webUrl: process.env.NEXT_PUBLIC_WEB_URL,
    });
  }

  async recordCashPayment(
    bookingId: string,
    actorUserId?: string,
    note?: string,
  ): Promise<BookingDetailDto> {
    const booking = await this.findBookingOrThrow(bookingId);
    if (booking.status !== 'pending_payment') {
      throw new BadRequestException(
        `Paiement cash impossible : statut actuel « ${booking.status} ».`,
      );
    }
    if (booking.totalCents < 1) {
      throw new BadRequestException('Montant de réservation invalide.');
    }

    const existingSucceeded = await this.paymentsRepository.findOne({
      where: { bookingId, status: 'succeeded', deletedAt: IsNull() },
    });
    if (existingSucceeded) {
      throw new BadRequestException(
        'Un paiement a déjà été enregistré pour cette réservation.',
      );
    }

    const paymentId = newId();
    const trimmedNote = note?.trim();
    const confirmReason = trimmedNote
      ? `Paiement cash caisse — ${trimmedNote}`
      : 'Paiement cash caisse';

    await this.paymentsRepository.save(
      this.paymentsRepository.create({
        id: paymentId,
        bookingId,
        amountCents: booking.totalCents,
        currency: booking.currency,
        status: 'succeeded',
        provider: 'cash',
        externalId: `cash-${paymentId}`,
        createdByUserId: actorUserId ?? null,
      } as DeepPartial<Payments>),
    );

    return this.confirmBooking(bookingId, actorUserId, confirmReason);
  }

  async cancelBooking(
    id: string,
    actorUserId?: string,
    reason?: string,
  ): Promise<BookingDetailDto> {
    const booking = await this.findBookingOrThrow(id);
    if (
      booking.status !== 'pending_approval' &&
      booking.status !== 'pending_payment' &&
      booking.status !== 'confirmed'
    ) {
      throw new BadRequestException(
        `Impossible d'annuler une réservation au statut « ${booking.status} ».`,
      );
    }

    const fromStatus = booking.status;
    const shouldRestoreStock =
      fromStatus === 'pending_payment' || fromStatus === 'confirmed';

    await this.bookingsRepository.manager.transaction(async (manager) => {
      if (shouldRestoreStock) {
        const items = await manager.getRepository(BookingItems).find({
          where: { bookingId: id },
        });
        const lines = await this.bookingItemsToResolvedLines(manager, items);
        if (lines.length > 0) {
          await this.allocateStock(manager, lines, 'restore', actorUserId);
        }
      }

      const bookingsRepo = manager.getRepository(Bookings);
      const row = await bookingsRepo.findOne({ where: { id } });
      if (!row) throw new NotFoundException('Réservation introuvable.');
      row.status = 'cancelled';
      row.updatedByUserId = actorUserId ?? null;
      await bookingsRepo.save(row);
    });

    await this.statusHistory.record({
      bookingId: id,
      fromStatus,
      toStatus: 'cancelled',
      reason: reason?.trim() || 'Annulation',
      changedByUserId: actorUserId ?? null,
    });

    return this.getBookingDetail(id);
  }

  async markBookingRefunded(
    id: string,
    actorUserId?: string,
    reason?: string,
  ): Promise<BookingDetailDto> {
    const booking = await this.findBookingOrThrow(id);
    if (booking.status === 'refunded') {
      return this.getBookingDetail(id);
    }
    if (booking.status !== 'cancelled') {
      throw new BadRequestException(
        `Impossible de marquer remboursée une réservation au statut « ${booking.status} ».`,
      );
    }

    const fromStatus = booking.status;
    booking.status = 'refunded';
    booking.updatedByUserId = actorUserId ?? null;
    await this.bookingsRepository.save(booking);
    await this.statusHistory.record({
      bookingId: id,
      fromStatus,
      toStatus: 'refunded',
      reason: reason?.trim() || 'Remboursement',
      changedByUserId: actorUserId ?? null,
    });

    return this.getBookingDetail(id);
  }

  async updateBookingStatus(
    id: string,
    status: Bookings['status'],
    actorUserId?: string,
    reason?: string,
  ): Promise<BookingDetailDto> {
    const booking = await this.findBookingOrThrow(id);
    if (booking.status === status) {
      throw new BadRequestException(`La réservation est déjà au statut « ${status} ».`);
    }

    if (status === 'confirmed' && booking.status === 'pending_payment') {
      return this.confirmBooking(id, actorUserId, reason);
    }
    if (status === 'cancelled') {
      return this.cancelBooking(id, actorUserId, reason);
    }
    if (status === 'refunded' && booking.status === 'cancelled') {
      return this.markBookingRefunded(id, actorUserId, reason);
    }

    const allowed: Partial<Record<Bookings['status'], Bookings['status'][]>> = {
      draft: ['pending_payment'],
      pending_payment: ['draft', 'refunded'],
      confirmed: ['refunded'],
      cancelled: ['refunded'],
    };

    const permitted = allowed[booking.status];
    if (!permitted?.includes(status)) {
      throw new BadRequestException(
        `Transition « ${booking.status} » → « ${status} » non autorisée.`,
      );
    }

    const fromStatus = booking.status;
    booking.status = status;
    booking.updatedByUserId = actorUserId ?? null;
    await this.bookingsRepository.save(booking);
    await this.statusHistory.record({
      bookingId: id,
      fromStatus,
      toStatus: status,
      reason: reason?.trim() || `Statut → ${status}`,
      changedByUserId: actorUserId ?? null,
    });

    return this.getBookingDetail(id);
  }

  async getBookingDetail(id: string): Promise<BookingDetailDto> {
    const booking = await this.findBookingOrThrow(id);
    const items = await this.bookingItemsRepository
      .createQueryBuilder('bi')
      .where('bi.bookingId = :bookingId', { bookingId: id })
      .andWhere('bi.deletedAt IS NULL')
      .orderBy('bi.startDate', 'ASC')
      .addOrderBy('bi.createdAt', 'ASC')
      .getMany();

    return {
      booking,
      items,
      totalCents: booking.totalCents,
      currency: booking.currency,
    };
  }

  private assertPreferredPaymentMethod(dto: BookingCheckoutDto): void {
    if (!dto.preferredPaymentMethod) {
      throw new BadRequestException(
        'Le mode de paiement (preferredPaymentMethod) est obligatoire.',
      );
    }
  }

  /**
   * POS : si `organizationId` est fourni, l’acteur doit y accéder et chaque
   * produit catalogue doit être partagé (NULL) ou appartenir à cette org.
   */
  private async assertCheckoutOrganizationScope(
    dto: BookingCheckoutDto,
    actorUserId: string,
  ): Promise<void> {
    const organizationId = dto.organizationId?.trim();
    if (!organizationId) {
      return;
    }

    const user = await this.usersRepository.findOne({ where: { id: actorUserId } });
    if (!user || user.deletedAt) {
      throw new BadRequestException('Utilisateur introuvable.');
    }

    await this.orgScopeService.assertCanAccessOrganization(
      toAuthUserDto(user),
      organizationId,
    );

    const seen = new Set<string>();
    for (const item of dto.items) {
      if (item.itemType === 'package') {
        await this.assertPackageCatalogOrganization(
          item.referenceId,
          organizationId,
          seen,
        );
        continue;
      }
      await this.assertCheckoutItemCatalogOrganization(
        item,
        organizationId,
        seen,
      );
    }
  }

  private assertCatalogProductOrganization(
    productOrganizationId: string | null | undefined,
    checkoutOrganizationId: string,
    label: string,
  ): void {
    if (
      productOrganizationId != null &&
      productOrganizationId !== checkoutOrganizationId
    ) {
      throw new BadRequestException(
        `Ce produit n’est pas disponible pour l’organisation sélectionnée (${label}).`,
      );
    }
  }

  private async assertCheckoutItemCatalogOrganization(
    item: BookingCheckoutItemDto,
    organizationId: string,
    seen: Set<string>,
  ): Promise<void> {
    switch (item.itemType) {
      case 'room': {
        const room = await this.roomsRepository.findOne({
          where: { id: item.referenceId },
        });
        if (!room || room.deletedAt) {
          throw new NotFoundException(`Chambre introuvable : ${item.referenceId}.`);
        }
        const key = `property:${room.propertyId}`;
        if (seen.has(key)) return;
        seen.add(key);
        const property = await this.propertiesRepository.findOne({
          where: { id: room.propertyId },
        });
        if (!property || property.deletedAt) {
          throw new NotFoundException('Hébergement introuvable.');
        }
        this.assertCatalogProductOrganization(
          property.organizationId,
          organizationId,
          property.name,
        );
        return;
      }
      case 'flight_class': {
        const flightClass = await this.flightClassesRepository.findOne({
          where: { id: item.referenceId },
        });
        if (!flightClass || flightClass.deletedAt) {
          throw new NotFoundException(
            `Classe de vol introuvable : ${item.referenceId}.`,
          );
        }
        const key = `flight:${flightClass.flightId}`;
        if (seen.has(key)) return;
        seen.add(key);
        const flight = await this.flightsRepository.findOne({
          where: { id: flightClass.flightId },
        });
        if (!flight || flight.deletedAt) {
          throw new NotFoundException('Vol introuvable.');
        }
        this.assertCatalogProductOrganization(
          flight.organizationId,
          organizationId,
          flight.flightNumber?.trim() || flight.id.slice(0, 8),
        );
        return;
      }
      case 'vehicle': {
        const slot = await this.vehicleAvailabilityRepository.findOne({
          where: { id: item.referenceId },
        });
        if (!slot || slot.deletedAt) {
          throw new NotFoundException(
            `Créneau véhicule introuvable : ${item.referenceId}.`,
          );
        }
        const key = `vehicle:${slot.vehicleId}`;
        if (seen.has(key)) return;
        seen.add(key);
        const vehicle = await this.vehiclesRepository.findOne({
          where: { id: slot.vehicleId },
        });
        if (!vehicle || vehicle.deletedAt) {
          throw new NotFoundException('Véhicule introuvable.');
        }
        this.assertCatalogProductOrganization(
          vehicle.organizationId,
          organizationId,
          vehicle.licensePlate?.trim() || vehicle.id.slice(0, 8),
        );
        return;
      }
      case 'cabin': {
        const availability = await this.cabinAvailabilityRepository.findOne({
          where: { id: item.referenceId },
        });
        if (!availability || availability.deletedAt) {
          throw new NotFoundException(
            `Disponibilité cabine introuvable : ${item.referenceId}.`,
          );
        }
        const key = `cabin:${availability.cabinId}`;
        if (seen.has(key)) return;
        seen.add(key);
        const cabin = await this.cabinsRepository.findOne({
          where: { id: availability.cabinId },
        });
        if (!cabin || cabin.deletedAt) {
          throw new NotFoundException('Cabine introuvable.');
        }
        this.assertCatalogProductOrganization(
          cabin.organizationId,
          organizationId,
          cabin.categoryName,
        );
        return;
      }
      case 'activity_schedule': {
        const schedule = await this.activitySchedulesRepository.findOne({
          where: { id: item.referenceId },
        });
        if (!schedule || schedule.deletedAt) {
          throw new NotFoundException(
            `Créneau activité introuvable : ${item.referenceId}.`,
          );
        }
        const key = `activity:${schedule.activityId}`;
        if (seen.has(key)) return;
        seen.add(key);
        const activity = await this.activitiesRepository.findOne({
          where: { id: schedule.activityId },
        });
        if (!activity || activity.deletedAt) {
          throw new NotFoundException('Activité introuvable.');
        }
        this.assertCatalogProductOrganization(
          activity.organizationId,
          organizationId,
          activity.title,
        );
        return;
      }
      default:
        throw new BadRequestException('Type d’item non supporté.');
    }
  }

  private async assertPackageCatalogOrganization(
    packageId: string,
    organizationId: string,
    seen: Set<string>,
  ): Promise<void> {
    const detail = await this.packagesService.findOneDetail(packageId);
    for (const pkgItem of detail.items) {
      const key = `${pkgItem.itemType}:${pkgItem.itemId}`;
      if (seen.has(key)) continue;
      seen.add(key);

      switch (pkgItem.itemType) {
        case 'property': {
          const property = await this.propertiesRepository.findOne({
            where: { id: pkgItem.itemId },
          });
          if (!property || property.deletedAt) {
            throw new NotFoundException(
              `Hébergement du forfait introuvable : ${pkgItem.itemId}.`,
            );
          }
          this.assertCatalogProductOrganization(
            property.organizationId,
            organizationId,
            property.name,
          );
          break;
        }
        case 'flight': {
          const flight = await this.flightsRepository.findOne({
            where: { id: pkgItem.itemId },
          });
          if (!flight || flight.deletedAt) {
            throw new NotFoundException(
              `Vol du forfait introuvable : ${pkgItem.itemId}.`,
            );
          }
          this.assertCatalogProductOrganization(
            flight.organizationId,
            organizationId,
            flight.flightNumber?.trim() || flight.id.slice(0, 8),
          );
          break;
        }
        case 'vehicle': {
          const vehicle = await this.vehiclesRepository.findOne({
            where: { id: pkgItem.itemId },
          });
          if (!vehicle || vehicle.deletedAt) {
            throw new NotFoundException(
              `Véhicule du forfait introuvable : ${pkgItem.itemId}.`,
            );
          }
          this.assertCatalogProductOrganization(
            vehicle.organizationId,
            organizationId,
            vehicle.licensePlate?.trim() || vehicle.id.slice(0, 8),
          );
          break;
        }
        case 'cruise': {
          const cabin = await this.cabinsRepository.findOne({
            where: { id: pkgItem.itemId },
          });
          if (!cabin || cabin.deletedAt) {
            throw new NotFoundException(
              `Cabine du forfait introuvable : ${pkgItem.itemId}.`,
            );
          }
          this.assertCatalogProductOrganization(
            cabin.organizationId,
            organizationId,
            cabin.categoryName,
          );
          break;
        }
        case 'activity': {
          const activity = await this.activitiesRepository.findOne({
            where: { id: pkgItem.itemId },
          });
          if (!activity || activity.deletedAt) {
            throw new NotFoundException(
              `Activité du forfait introuvable : ${pkgItem.itemId}.`,
            );
          }
          this.assertCatalogProductOrganization(
            activity.organizationId,
            organizationId,
            activity.title,
          );
          break;
        }
        default:
          break;
      }
    }
  }

  private async resolveCheckoutPricing(dto: BookingCheckoutDto): Promise<{
    lines: ResolvedBookingLine[];
    currency: string;
    subtotalCents: number;
    packageDiscountCents: number;
    discountCents: number;
    totalCents: number;
    appliedPackageDiscount: AppliedPackageCheckoutDiscountDto | null;
    appliedDiscount: AppliedCheckoutDiscountDto | null;
    discount: import('./booking-checkout-promo.service').AppliedCheckoutDiscount | null;
  }> {
    const { lines, currency } = await this.resolveCheckoutLines(dto);
    const subtotalCents = lines.reduce((sum, l) => sum + l.lineTotalCents, 0);

    let packageDiscountCents = 0;
    let appliedPackageDiscount: AppliedPackageCheckoutDiscountDto | null = null;

    if (dto.packageId) {
      const packageDiscount = await this.packageCheckout.resolvePackageDiscount(
        dto.packageId,
        dto.items,
        subtotalCents,
      );
      packageDiscountCents = packageDiscount.discountCents;
      appliedPackageDiscount = {
        packageId: packageDiscount.packageId,
        name: packageDiscount.name,
        discountPercent: packageDiscount.discountPercent,
        discountCents: packageDiscount.discountCents,
      };
    }

    const subtotalAfterPackage = Math.max(0, subtotalCents - packageDiscountCents);
    const discount = await this.checkoutPromo.resolveDiscount(dto, subtotalAfterPackage);
    const promoDiscountCents = discount?.discountCents ?? 0;
    const totalDiscountCents = packageDiscountCents + promoDiscountCents;
    const totalCents = Math.max(0, subtotalCents - totalDiscountCents);

    return {
      lines,
      currency,
      subtotalCents,
      packageDiscountCents,
      discountCents: totalDiscountCents,
      totalCents,
      appliedPackageDiscount,
      appliedDiscount: discount
        ? {
            kind: discount.kind,
            id: discount.id,
            label: discount.label,
            discountType: discount.discountType,
            discountValue: discount.discountValue,
            discountCents: discount.discountCents,
          }
        : null,
      discount,
    };
  }

  private async resolveCheckoutLines(
    dto: BookingCheckoutDto,
  ): Promise<{ lines: ResolvedBookingLine[]; currency: string }> {
    const requestedCurrency = (dto.currency ?? 'USD').trim().toUpperCase();
    const lines: ResolvedBookingLine[] = [];

    for (const item of dto.items) {
      const resolved = await this.resolveItem(item);
      lines.push(...resolved);
    }

    if (lines.length === 0) {
      throw new BadRequestException('Au moins un item réservable est requis.');
    }

    const currencies = new Set(lines.map((l) => l.currency));
    if (currencies.size > 1) {
      throw new BadRequestException(
        'Tous les items doivent utiliser la même devise.',
      );
    }

    const lineCurrency = [...currencies][0];
    if (lineCurrency !== requestedCurrency) {
      throw new BadRequestException(
        `La devise demandée (${requestedCurrency}) ne correspond pas à celle des produits (${lineCurrency}).`,
      );
    }

    return { lines, currency: lineCurrency };
  }

  private async resolveItem(item: BookingCheckoutItemDto): Promise<ResolvedBookingLine[]> {
    switch (item.itemType) {
      case 'room':
        return this.resolveRoomItem(item);
      case 'flight_class':
        return this.resolveFlightClassItem(item);
      case 'vehicle':
        return this.resolveVehicleItem(item);
      case 'cabin':
        return this.resolveCabinItem(item);
      case 'activity_schedule':
        return this.resolveActivityScheduleItem(item);
      case 'package':
        return this.resolvePackageItem(item);
      default:
        throw new BadRequestException('Type d’item non supporté.');
    }
  }

  private async resolveRoomItem(item: BookingCheckoutItemDto): Promise<ResolvedBookingLine[]> {
    if (!item.startDate || !item.endDate) {
      throw new BadRequestException('startDate et endDate sont requis pour une chambre.');
    }

    const room = await this.roomsRepository.findOne({ where: { id: item.referenceId } });
    if (!room || room.deletedAt) {
      throw new NotFoundException(`Chambre introuvable : ${item.referenceId}.`);
    }

    const lines: ResolvedBookingLine[] = [];
    const dates = enumerateDates(item.startDate, item.endDate);

    for (const date of dates) {
      const availability = await this.roomAvailabilityRepository.findOne({
        where: { roomId: item.referenceId, date },
      });
      if (!availability || availability.deletedAt) {
        throw new BadRequestException(
          `Aucune disponibilité pour ${room.name} le ${date}.`,
        );
      }
      if (availability.availableUnits < item.quantity) {
        throw new BadRequestException(
          `Stock insuffisant pour ${room.name} le ${date} (demandé: ${item.quantity}, disponible: ${availability.availableUnits}).`,
        );
      }

      const unitPriceCents = availability.priceCents;
      lines.push({
        itemType: 'room',
        referenceId: item.referenceId,
        quantity: item.quantity,
        unitPriceCents,
        lineTotalCents: item.quantity * unitPriceCents,
        titleSnapshot: room.name,
        currency: room.currency,
        startDate: date,
        endDate: date,
        stock: { kind: 'room', roomId: item.referenceId, date },
      });
    }

    return lines;
  }

  private async resolveFlightClassItem(
    item: BookingCheckoutItemDto,
  ): Promise<ResolvedBookingLine[]> {
    if (!item.date) {
      throw new BadRequestException('date est requis pour une classe de vol.');
    }

    const flightClass = await this.flightClassesRepository.findOne({
      where: { id: item.referenceId },
    });
    if (!flightClass || flightClass.deletedAt) {
      throw new NotFoundException(`Classe de vol introuvable : ${item.referenceId}.`);
    }

    const availability = await this.flightAvailabilityRepository.findOne({
      where: { flightClassId: item.referenceId, date: item.date },
    });
    if (!availability || availability.deletedAt) {
      throw new BadRequestException(
        `Aucune disponibilité pour la classe ${flightClass.className} le ${item.date}.`,
      );
    }
    if (availability.availableSeats < item.quantity) {
      throw new BadRequestException(
        `Sièges insuffisants (${item.quantity} demandés, ${availability.availableSeats} disponibles).`,
      );
    }

    const unitPriceCents = availability.priceCents;
    const title = `Vol ${flightClass.className} (${item.date})`;

    return [
      {
        itemType: 'flight_class',
        referenceId: item.referenceId,
        quantity: item.quantity,
        unitPriceCents,
        lineTotalCents: item.quantity * unitPriceCents,
        titleSnapshot: title,
        currency: 'USD',
        startDate: item.date,
        endDate: item.date,
        stock: {
          kind: 'flight_class',
          flightClassId: item.referenceId,
          date: item.date,
        },
      },
    ];
  }

  private async resolveVehicleItem(
    item: BookingCheckoutItemDto,
  ): Promise<ResolvedBookingLine[]> {
    const slot = await this.vehicleAvailabilityRepository.findOne({
      where: { id: item.referenceId },
    });
    if (!slot || slot.deletedAt) {
      throw new NotFoundException(`Créneau véhicule introuvable : ${item.referenceId}.`);
    }
    if (item.quantity !== 1) {
      throw new BadRequestException('La réservation véhicule accepte une quantité de 1 par créneau.');
    }
    if (slot.status !== 'available') {
      throw new BadRequestException('Le véhicule n’est pas disponible sur ce créneau.');
    }
    if (!item.startDate || !item.endDate) {
      throw new BadRequestException(
        'startDate et endDate sont requis pour une location véhicule.',
      );
    }

    assertValidVehicleDates(item.startDate, item.endDate);
    if (
      !slotCoversRentalPeriod(
        slot.startDatetime,
        slot.endDatetime,
        item.startDate,
        item.endDate,
      )
    ) {
      throw new BadRequestException(
        'Le créneau véhicule ne couvre pas la période demandée.',
      );
    }

    const vehicle = await this.vehiclesRepository.findOne({
      where: { id: slot.vehicleId },
    });
    if (!vehicle || vehicle.deletedAt) {
      throw new NotFoundException('Véhicule introuvable.');
    }

    const rentalDays = countRentalDays(item.startDate, item.endDate);
    const unitPriceCents = vehicle.dailyPriceCents;

    return [
      {
        itemType: 'vehicle',
        referenceId: item.referenceId,
        quantity: item.quantity,
        unitPriceCents,
        lineTotalCents: item.quantity * unitPriceCents * rentalDays,
        titleSnapshot: vehicle.licensePlate?.trim() || `Véhicule ${vehicle.id.slice(0, 8)}`,
        currency: vehicle.currency,
        startDate: item.startDate,
        endDate: item.endDate,
        stock: { kind: 'vehicle', availabilityId: item.referenceId },
      },
    ];
  }

  private async resolveCabinItem(item: BookingCheckoutItemDto): Promise<ResolvedBookingLine[]> {
    const availability = await this.cabinAvailabilityRepository.findOne({
      where: { id: item.referenceId },
    });
    if (!availability || availability.deletedAt) {
      throw new NotFoundException(`Disponibilité cabine introuvable : ${item.referenceId}.`);
    }
    if (availability.availableCount < item.quantity) {
      throw new BadRequestException(
        `Cabines insuffisantes (${item.quantity} demandées, ${availability.availableCount} disponibles).`,
      );
    }

    const cabin = await this.cabinsRepository.findOne({
      where: { id: availability.cabinId },
    });
    if (!cabin || cabin.deletedAt) {
      throw new NotFoundException('Cabine introuvable.');
    }

    const unitPriceCents = availability.priceCents;

    return [
      {
        itemType: 'cabin',
        referenceId: item.referenceId,
        quantity: item.quantity,
        unitPriceCents,
        lineTotalCents: item.quantity * unitPriceCents,
        titleSnapshot: cabin.categoryName,
        currency: cabin.currency,
        startDate: null,
        endDate: null,
        stock: { kind: 'cabin', availabilityId: item.referenceId },
      },
    ];
  }

  private async resolvePackageItem(
    item: BookingCheckoutItemDto,
  ): Promise<ResolvedBookingLine[]> {
    const resolved = await this.packageCheckout.resolveAssistedPackageLine(item);
    return [
      {
        itemType: 'package',
        referenceId: resolved.referenceId,
        quantity: resolved.quantity,
        unitPriceCents: resolved.unitPriceCents,
        lineTotalCents: resolved.lineTotalCents,
        titleSnapshot: resolved.titleSnapshot,
        currency: resolved.currency,
        startDate: resolved.startDate,
        endDate: resolved.endDate,
      },
    ];
  }

  private async resolveActivityScheduleItem(
    item: BookingCheckoutItemDto,
  ): Promise<ResolvedBookingLine[]> {
    const schedule = await this.activitySchedulesRepository.findOne({
      where: { id: item.referenceId },
    });
    if (!schedule || schedule.deletedAt) {
      throw new NotFoundException(`Créneau activité introuvable : ${item.referenceId}.`);
    }

    const remaining = schedule.capacity - schedule.bookedCount;
    if (remaining < item.quantity) {
      throw new BadRequestException(
        `Places insuffisantes (${item.quantity} demandées, ${remaining} restantes).`,
      );
    }

    const activity = await this.activitiesRepository.findOne({
      where: { id: schedule.activityId },
    });
    if (!activity || activity.deletedAt) {
      throw new NotFoundException('Activité introuvable.');
    }

    const unitPriceCents = activity.priceCents;
    const dateIso = schedule.startDatetime instanceof Date
      ? schedule.startDatetime.toISOString().slice(0, 10)
      : String(schedule.startDatetime).slice(0, 10);

    return [
      {
        itemType: 'activity_schedule',
        referenceId: item.referenceId,
        quantity: item.quantity,
        unitPriceCents,
        lineTotalCents: item.quantity * unitPriceCents,
        titleSnapshot: activity.title,
        currency: activity.currency,
        startDate: dateIso,
        endDate: dateIso,
        stock: { kind: 'activity_schedule', scheduleId: item.referenceId },
      },
    ];
  }

  private async allocateStock(
    manager: EntityManager,
    lines: ResolvedBookingLine[],
    direction: 'decrement' | 'restore',
    actorUserId?: string,
  ): Promise<void> {
    for (const line of lines) {
      if (!line.stock) continue;
      await this.applyStockChange(manager, line.stock, line.quantity, direction, actorUserId);
    }
  }

  private async applyStockChange(
    manager: EntityManager,
    stock: StockTarget,
    quantity: number,
    direction: 'decrement' | 'restore',
    actorUserId?: string,
  ): Promise<void> {
    const delta = direction === 'decrement' ? -1 : 1;

    switch (stock.kind) {
      case 'room': {
        const repo = manager.getRepository(RoomAvailability);
        const row = await repo.findOne({
          where: { roomId: stock.roomId, date: stock.date },
          lock: { mode: 'pessimistic_write' },
        });
        if (!row || row.deletedAt) {
          throw new BadRequestException(
            `Disponibilité chambre introuvable le ${stock.date}.`,
          );
        }
        const next = row.availableUnits + delta * quantity;
        if (next < 0) {
          throw new BadRequestException(`Stock chambre insuffisant le ${stock.date}.`);
        }
        row.availableUnits = next;
        row.updatedByUserId = actorUserId ?? null;
        await repo.save(row);
        break;
      }
      case 'flight_class': {
        const repo = manager.getRepository(FlightClassAvailability);
        const row = await repo.findOne({
          where: { flightClassId: stock.flightClassId, date: stock.date },
          lock: { mode: 'pessimistic_write' },
        });
        if (!row || row.deletedAt) {
          throw new BadRequestException(
            `Disponibilité vol introuvable le ${stock.date}.`,
          );
        }
        const next = row.availableSeats + delta * quantity;
        if (next < 0) {
          throw new BadRequestException(`Sièges insuffisants le ${stock.date}.`);
        }
        row.availableSeats = next;
        row.updatedByUserId = actorUserId ?? null;
        await repo.save(row);
        break;
      }
      case 'vehicle': {
        const repo = manager.getRepository(VehicleAvailability);
        const row = await repo.findOne({
          where: { id: stock.availabilityId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!row || row.deletedAt) {
          throw new BadRequestException('Créneau véhicule introuvable.');
        }
        if (direction === 'decrement') {
          if (row.status !== 'available') {
            throw new BadRequestException('Véhicule déjà indisponible.');
          }
          row.status = 'rented';
        } else {
          row.status = 'available';
        }
        row.updatedByUserId = actorUserId ?? null;
        await repo.save(row);
        break;
      }
      case 'cabin': {
        const repo = manager.getRepository(CabinAvailability);
        const row = await repo.findOne({
          where: { id: stock.availabilityId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!row || row.deletedAt) {
          throw new BadRequestException('Disponibilité cabine introuvable.');
        }
        const next = row.availableCount + delta * quantity;
        if (next < 0) {
          throw new BadRequestException('Cabines insuffisantes.');
        }
        row.availableCount = next;
        row.updatedByUserId = actorUserId ?? null;
        await repo.save(row);
        break;
      }
      case 'activity_schedule': {
        const repo = manager.getRepository(ActivitySchedules);
        const row = await repo.findOne({
          where: { id: stock.scheduleId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!row || row.deletedAt) {
          throw new BadRequestException('Créneau activité introuvable.');
        }
        const next = row.bookedCount - delta * quantity;
        if (next < 0 || next > row.capacity) {
          throw new BadRequestException('Capacité activité invalide.');
        }
        row.bookedCount = next;
        row.updatedByUserId = actorUserId ?? null;
        await repo.save(row);
        break;
      }
      default:
        break;
    }
  }

  private async bookingItemsToResolvedLines(
    manager: EntityManager,
    items: BookingItems[],
  ): Promise<ResolvedBookingLine[]> {
    const active = items.filter((i) => !i.deletedAt);
    const lines: ResolvedBookingLine[] = [];

    for (const item of active) {
      const lineTotalCents = item.quantity * item.unitPriceCents;
      const base: BookingCheckoutLineDto = {
        itemType: item.itemType,
        referenceId: item.referenceId,
        quantity: item.quantity,
        unitPriceCents: item.unitPriceCents,
        lineTotalCents,
        titleSnapshot: item.titleSnapshot,
        currency: 'USD',
        startDate: item.startDate,
        endDate: item.endDate,
      };

      switch (item.itemType) {
        case 'room': {
          const date = item.startDate;
          if (!date) break;
          lines.push({
            ...base,
            stock: { kind: 'room', roomId: item.referenceId, date },
          });
          break;
        }
        case 'flight_class': {
          const date = item.startDate;
          if (!date) break;
          lines.push({
            ...base,
            stock: {
              kind: 'flight_class',
              flightClassId: item.referenceId,
              date,
            },
          });
          break;
        }
        case 'vehicle':
          lines.push({
            ...base,
            stock: { kind: 'vehicle', availabilityId: item.referenceId },
          });
          break;
        case 'cabin':
          lines.push({
            ...base,
            stock: { kind: 'cabin', availabilityId: item.referenceId },
          });
          break;
        case 'activity_schedule':
          lines.push({
            ...base,
            stock: { kind: 'activity_schedule', scheduleId: item.referenceId },
          });
          break;
        case 'package':
          break;
        default:
          break;
      }
    }

    return lines;
  }

  private async expandPackageBookingItems(
    manager: EntityManager,
    items: BookingItems[],
    actorUserId?: string,
  ): Promise<BookingItems[]> {
    const itemsRepo = manager.getRepository(BookingItems);
    const active = items.filter((item) => !item.deletedAt);
    const packageItems = active.filter((item) => item.itemType === 'package');

    if (packageItems.length === 0) {
      return items;
    }

    const created: BookingItems[] = active.filter((item) => item.itemType !== 'package');

    for (const packageItem of packageItems) {
      if (!packageItem.startDate || !packageItem.endDate) {
        throw new BadRequestException('Dates du forfait manquantes.');
      }

      const resolvedLines = await this.packageCheckout.resolvePackageLinesForApproval(
        packageItem.referenceId,
        {
          startDate: packageItem.startDate,
          endDate: packageItem.endDate,
          travelers: packageItem.quantity,
        },
      );

      for (const line of resolvedLines) {
        const checkoutItems = this.packageResolvedLineToCheckoutItems(line);
        for (const checkoutItem of checkoutItems) {
          const resolved = await this.resolveItem(checkoutItem);
          for (const resolvedLine of resolved) {
            const row = itemsRepo.create({
              id: newId(),
              bookingId: packageItem.bookingId,
              itemType: resolvedLine.itemType,
              referenceId: resolvedLine.referenceId,
              titleSnapshot: resolvedLine.titleSnapshot,
              quantity: resolvedLine.quantity,
              unitPriceCents: resolvedLine.unitPriceCents,
              startDate: resolvedLine.startDate,
              endDate: resolvedLine.endDate,
              createdByUserId: actorUserId ?? null,
            } as BookingItems);
            await itemsRepo.save(row);
            created.push(row);
          }
        }
      }

      packageItem.deletedAt = new Date();
      packageItem.deletedByUserId = actorUserId ?? null;
      packageItem.updatedByUserId = actorUserId ?? null;
      await itemsRepo.save(packageItem);
    }

    return created;
  }

  private packageResolvedLineToCheckoutItems(
    line: PackageResolvedLineDto,
  ): BookingCheckoutItemDto[] {
    switch (line.lineType) {
      case 'activity':
        return [
          {
            itemType: 'activity_schedule',
            referenceId: line.scheduleId!,
            quantity: line.participants!,
          },
        ];
      case 'property':
        return [
          {
            itemType: 'room',
            referenceId: line.roomId!,
            quantity: 1,
            startDate: line.checkIn,
            endDate: line.checkOut,
          },
        ];
      case 'flight':
        return [
          {
            itemType: 'flight_class',
            referenceId: line.flightClassId!,
            quantity: line.passengers!,
            date: line.departureDate,
          },
        ];
      case 'vehicle':
        return [
          {
            itemType: 'vehicle',
            referenceId: line.availabilitySlotId!,
            quantity: 1,
            startDate: line.pickupDate,
            endDate: line.returnDate,
          },
        ];
      case 'cruise':
        return [
          {
            itemType: 'cabin',
            referenceId: line.cabinAvailabilityId!,
            quantity: line.guests!,
          },
        ];
      default:
        throw new BadRequestException('Type de ligne forfait non supporté.');
    }
  }

  private async findBookingOrThrow(id: string): Promise<Bookings> {
    const booking = await this.bookingsRepository.findOne({ where: { id } });
    if (!booking || booking.deletedAt) {
      throw new NotFoundException('Réservation introuvable.');
    }
    return booking;
  }
}
