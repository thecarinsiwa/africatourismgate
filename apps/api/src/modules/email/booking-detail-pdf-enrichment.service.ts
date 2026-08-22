import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { filterActivityItineraryStopsByDuration } from '../../common/activity-itinerary-stops.util';
import {
  Activities,
  ActivityItineraryStops,
  ActivityProviders,
  ActivitySchedules,
  Airports,
  BookingGuideAssignments,
  BookingItems,
  CabinAvailability,
  CruisePorts,
  CruiseSailings,
  FlightClasses,
  Flights,
  ItineraryPorts,
  PackageItems,
  Payments,
  Properties,
  Rooms,
  TourGuides,
  VehicleAvailability,
  Vehicles,
} from '../../entities/generated';
import type { BookingManifestEntryDto } from '../resources/bookings/dto/booking-manifest-entry.dto';
import type { BookingDetailDto } from '../resources/bookings/dto/booking-detail.dto';
import type { BookingDetailPdfLocale } from './booking-detail-pdf.labels';
import type {
  BookingDetailPdfGuide,
  BookingDetailPdfItineraryGroup,
  BookingDetailPdfItineraryStep,
  BookingDetailPdfPayment,
} from './booking-detail-pdf.types';

const STEP_LABELS: Record<
  BookingDetailPdfLocale,
  { departure: string; arrival: string; day: string }
> = {
  fr: { departure: 'Départ', arrival: 'Arrivée', day: 'Jour' },
  en: { departure: 'Departure', arrival: 'Arrival', day: 'Day' },
  es: { departure: 'Salida', arrival: 'Llegada', day: 'Día' },
};

@Injectable()
export class BookingDetailPdfEnrichmentService {
  constructor(
    @InjectRepository(BookingGuideAssignments)
    private readonly guideAssignmentsRepository: Repository<BookingGuideAssignments>,
    @InjectRepository(TourGuides)
    private readonly tourGuidesRepository: Repository<TourGuides>,
    @InjectRepository(Payments)
    private readonly paymentsRepository: Repository<Payments>,
    @InjectRepository(ActivitySchedules)
    private readonly activitySchedulesRepository: Repository<ActivitySchedules>,
    @InjectRepository(Activities)
    private readonly activitiesRepository: Repository<Activities>,
    @InjectRepository(ActivityItineraryStops)
    private readonly activityItineraryStopsRepository: Repository<ActivityItineraryStops>,
    @InjectRepository(ActivityProviders)
    private readonly activityProvidersRepository: Repository<ActivityProviders>,
    @InjectRepository(PackageItems)
    private readonly packageItemsRepository: Repository<PackageItems>,
    @InjectRepository(Rooms)
    private readonly roomsRepository: Repository<Rooms>,
    @InjectRepository(Properties)
    private readonly propertiesRepository: Repository<Properties>,
    @InjectRepository(FlightClasses)
    private readonly flightClassesRepository: Repository<FlightClasses>,
    @InjectRepository(Flights)
    private readonly flightsRepository: Repository<Flights>,
    @InjectRepository(Airports)
    private readonly airportsRepository: Repository<Airports>,
    @InjectRepository(VehicleAvailability)
    private readonly vehicleAvailabilityRepository: Repository<VehicleAvailability>,
    @InjectRepository(Vehicles)
    private readonly vehiclesRepository: Repository<Vehicles>,
    @InjectRepository(CabinAvailability)
    private readonly cabinAvailabilityRepository: Repository<CabinAvailability>,
    @InjectRepository(CruiseSailings)
    private readonly cruiseSailingsRepository: Repository<CruiseSailings>,
    @InjectRepository(ItineraryPorts)
    private readonly itineraryPortsRepository: Repository<ItineraryPorts>,
    @InjectRepository(CruisePorts)
    private readonly cruisePortsRepository: Repository<CruisePorts>,
  ) {}

  async enrich(
    bookingId: string,
    detail: BookingDetailDto,
    manifest: BookingManifestEntryDto[],
    locale: BookingDetailPdfLocale,
  ): Promise<{
    guides: BookingDetailPdfGuide[];
    itinerary: BookingDetailPdfItineraryGroup[];
    payments: BookingDetailPdfPayment[];
    bookingCreatedAt: string;
  }> {
    const [guides, itinerary, payments] = await Promise.all([
      this.loadGuides(bookingId),
      this.loadItinerary(detail.items, locale),
      this.loadPayments(bookingId),
    ]);

    return {
      guides,
      itinerary,
      payments,
      bookingCreatedAt:
        detail.booking.createdAt instanceof Date
          ? detail.booking.createdAt.toISOString()
          : String(detail.booking.createdAt),
    };
  }

  private async loadGuides(bookingId: string): Promise<BookingDetailPdfGuide[]> {
    const assignments = await this.guideAssignmentsRepository.find({
      where: { bookingId },
      order: { assignedAt: 'ASC' },
    });
    if (!assignments.length) {
      return [];
    }

    const guideIds = [...new Set(assignments.map((row) => row.guideId))];
    const guides = await this.tourGuidesRepository.find({
      where: { id: In(guideIds), deletedAt: IsNull() },
    });
    const guideById = new Map(guides.map((guide) => [guide.id, guide]));

    return assignments
      .map((assignment) => {
        const guide = guideById.get(assignment.guideId);
        if (!guide) {
          return null;
        }
        return {
          name: guide.displayName,
          role: assignment.role,
        };
      })
      .filter((row): row is BookingDetailPdfGuide => row != null);
  }

  private async loadPayments(bookingId: string): Promise<BookingDetailPdfPayment[]> {
    const rows = await this.paymentsRepository.find({
      where: { bookingId, deletedAt: IsNull() },
      order: { createdAt: 'ASC' },
    });

    return rows.map((payment) => ({
      amountCents: payment.amountCents,
      currency: payment.currency,
      status: payment.status,
      provider: payment.provider?.trim() || '—',
      createdAt:
        payment.createdAt instanceof Date
          ? payment.createdAt.toISOString()
          : String(payment.createdAt),
    }));
  }

  private async loadItinerary(
    items: BookingItems[],
    locale: BookingDetailPdfLocale,
  ): Promise<BookingDetailPdfItineraryGroup[]> {
    const groups: BookingDetailPdfItineraryGroup[] = [];

    for (const item of items) {
      const steps = await this.resolveItemItinerary(item, locale);
      groups.push({
        title: item.titleSnapshot,
        itemType: item.itemType,
        steps: steps.length > 0 ? steps : [{ order: 1, label: item.titleSnapshot }],
      });
    }

    return groups;
  }

  private async resolveItemItinerary(
    item: BookingItems,
    locale: BookingDetailPdfLocale,
  ): Promise<BookingDetailPdfItineraryStep[]> {
    switch (item.itemType) {
      case 'activity_schedule':
        return this.resolveActivityScheduleItinerary(item.referenceId);
      case 'package':
        return this.resolvePackageItinerary(item.referenceId, locale);
      case 'room':
        return this.resolveRoomItinerary(item.referenceId);
      case 'flight_class':
        return this.resolveFlightClassItinerary(item.referenceId, locale);
      case 'vehicle':
        return this.resolveVehicleItinerary(item.referenceId);
      case 'cabin':
        return this.resolveCabinItinerary(item.referenceId, locale);
      default:
        return [];
    }
  }

  private async resolveActivityScheduleItinerary(
    scheduleId: string,
  ): Promise<BookingDetailPdfItineraryStep[]> {
    const schedule = await this.activitySchedulesRepository.findOne({
      where: { id: scheduleId, deletedAt: IsNull() },
    });
    if (!schedule) {
      return [];
    }

    const activity = await this.activitiesRepository.findOne({
      where: { id: schedule.activityId, deletedAt: IsNull() },
    });
    if (!activity) {
      return [];
    }

    const stops = await this.activityItineraryStopsRepository.find({
      where: { activityId: activity.id },
      order: { stopOrder: 'ASC', createdAt: 'ASC' },
    });
    const activeStops = filterActivityItineraryStopsByDuration(
      stops.filter((stop) => !stop.deletedAt),
      activity.durationMinutes,
    );

    if (activeStops.length) {
      return activeStops.map((stop, index) => ({
        order: index + 1,
        label: stop.name,
        detail: stop.description?.trim() || null,
      }));
    }

    const provider = await this.activityProvidersRepository.findOne({
      where: { id: activity.providerId, deletedAt: IsNull() },
    });

    return [
      {
        order: 1,
        label: activity.title,
        detail: provider?.name ?? null,
      },
    ];
  }

  private async resolvePackageItinerary(
    packageId: string,
    locale: BookingDetailPdfLocale,
  ): Promise<BookingDetailPdfItineraryStep[]> {
    const packageItems = await this.packageItemsRepository.find({
      where: { packageId, deletedAt: IsNull() },
      order: { createdAt: 'ASC' },
    });

    const steps: BookingDetailPdfItineraryStep[] = [];
    let order = 1;

    for (const packageItem of packageItems) {
      const itemSteps = await this.resolvePackageItemSteps(packageItem, locale);
      for (const step of itemSteps) {
        steps.push({ ...step, order: order++ });
      }
    }

    return steps;
  }

  private async resolvePackageItemSteps(
    item: PackageItems,
    locale: BookingDetailPdfLocale,
  ): Promise<BookingDetailPdfItineraryStep[]> {
    const label = await this.resolvePackageItemLabel(item);

    switch (item.itemType) {
      case 'activity':
        return this.resolveActivityItineraryById(item.itemId, label);
      case 'property':
        return this.resolvePropertyItineraryById(item.itemId, label);
      case 'flight':
        return this.resolveFlightItineraryById(item.itemId, label, locale);
      default:
        return [{ order: 1, label }];
    }
  }

  private async resolvePackageItemLabel(item: PackageItems): Promise<string> {
    switch (item.itemType) {
      case 'activity': {
        const activity = await this.activitiesRepository.findOne({
          where: { id: item.itemId, deletedAt: IsNull() },
        });
        return activity?.title ?? item.itemId.slice(0, 8);
      }
      case 'property': {
        const property = await this.propertiesRepository.findOne({
          where: { id: item.itemId, deletedAt: IsNull() },
        });
        return property?.name ?? item.itemId.slice(0, 8);
      }
      case 'flight': {
        const flight = await this.flightsRepository.findOne({
          where: { id: item.itemId, deletedAt: IsNull() },
        });
        return flight?.flightNumber?.trim() || item.itemId.slice(0, 8);
      }
      default:
        return `${item.itemType} ${item.itemId.slice(0, 8)}`;
    }
  }

  private async resolveActivityItineraryById(
    activityId: string,
    fallbackLabel: string,
  ): Promise<BookingDetailPdfItineraryStep[]> {
    const activity = await this.activitiesRepository.findOne({
      where: { id: activityId, deletedAt: IsNull() },
    });
    if (!activity) {
      return [{ order: 1, label: fallbackLabel }];
    }

    const stops = await this.activityItineraryStopsRepository.find({
      where: { activityId: activity.id },
      order: { stopOrder: 'ASC', createdAt: 'ASC' },
    });
    const activeStops = filterActivityItineraryStopsByDuration(
      stops.filter((stop) => !stop.deletedAt),
      activity.durationMinutes,
    );

    if (activeStops.length) {
      return activeStops.map((stop, index) => ({
        order: index + 1,
        label: `${fallbackLabel} — ${stop.name}`,
        detail: stop.description?.trim() || null,
      }));
    }

    return [{ order: 1, label: `${fallbackLabel} — ${activity.title}` }];
  }

  private async resolvePropertyItineraryById(
    propertyId: string,
    fallbackLabel: string,
  ): Promise<BookingDetailPdfItineraryStep[]> {
    const property = await this.propertiesRepository.findOne({
      where: { id: propertyId, deletedAt: IsNull() },
    });
    if (!property) {
      return [{ order: 1, label: fallbackLabel }];
    }
    return [{ order: 1, label: `${fallbackLabel} — ${property.name}` }];
  }

  private async resolveFlightItineraryById(
    flightId: string,
    fallbackLabel: string,
    locale: BookingDetailPdfLocale,
  ): Promise<BookingDetailPdfItineraryStep[]> {
    const copy = STEP_LABELS[locale];
    const flight = await this.flightsRepository.findOne({
      where: { id: flightId, deletedAt: IsNull() },
    });
    if (!flight) {
      return [{ order: 1, label: fallbackLabel }];
    }

    const [departureAirport, arrivalAirport] = await Promise.all([
      this.airportsRepository.findOne({ where: { id: flight.departureAirportId } }),
      this.airportsRepository.findOne({ where: { id: flight.arrivalAirportId } }),
    ]);

    const steps: BookingDetailPdfItineraryStep[] = [];
    if (departureAirport && !departureAirport.deletedAt) {
      steps.push({
        order: steps.length + 1,
        label: `${fallbackLabel} — ${copy.departure} : ${departureAirport.name}`,
      });
    }
    if (arrivalAirport && !arrivalAirport.deletedAt) {
      steps.push({
        order: steps.length + 1,
        label: `${fallbackLabel} — ${copy.arrival} : ${arrivalAirport.name}`,
      });
    }
    return steps.length ? steps : [{ order: 1, label: fallbackLabel }];
  }

  private async resolveRoomItinerary(roomId: string): Promise<BookingDetailPdfItineraryStep[]> {
    const room = await this.roomsRepository.findOne({
      where: { id: roomId, deletedAt: IsNull() },
    });
    if (!room) {
      return [];
    }

    const property = await this.propertiesRepository.findOne({
      where: { id: room.propertyId, deletedAt: IsNull() },
    });
    if (!property) {
      return [{ order: 1, label: room.name }];
    }

    return [{ order: 1, label: `${property.name} — ${room.name}` }];
  }

  private async resolveFlightClassItinerary(
    flightClassId: string,
    locale: BookingDetailPdfLocale,
  ): Promise<BookingDetailPdfItineraryStep[]> {
    const flightClass = await this.flightClassesRepository.findOne({
      where: { id: flightClassId, deletedAt: IsNull() },
    });
    if (!flightClass) {
      return [];
    }

    return this.resolveFlightItineraryById(flightClass.flightId, flightClass.className, locale);
  }

  private async resolveVehicleItinerary(
    availabilityId: string,
  ): Promise<BookingDetailPdfItineraryStep[]> {
    const availability = await this.vehicleAvailabilityRepository.findOne({
      where: { id: availabilityId, deletedAt: IsNull() },
    });
    if (!availability) {
      return [];
    }

    const vehicle = await this.vehiclesRepository.findOne({
      where: { id: availability.vehicleId, deletedAt: IsNull() },
    });
    if (!vehicle) {
      return [];
    }

    return [{ order: 1, label: vehicle.licensePlate?.trim() || vehicle.id.slice(0, 8) }];
  }

  private async resolveCabinItinerary(
    availabilityId: string,
    locale: BookingDetailPdfLocale,
  ): Promise<BookingDetailPdfItineraryStep[]> {
    const copy = STEP_LABELS[locale];
    const availability = await this.cabinAvailabilityRepository.findOne({
      where: { id: availabilityId, deletedAt: IsNull() },
    });
    if (!availability) {
      return [];
    }

    const sailing = await this.cruiseSailingsRepository.findOne({
      where: { id: availability.sailingId, deletedAt: IsNull() },
    });
    if (!sailing) {
      return [];
    }

    const portRows = await this.itineraryPortsRepository.find({
      where: { itineraryId: sailing.itineraryId, deletedAt: IsNull() },
      order: { dayNumber: 'ASC', createdAt: 'ASC' },
    });

    if (!portRows.length) {
      return [{ order: 1, label: `${copy.departure} ${sailing.departureDate}` }];
    }

    const portIds = [...new Set(portRows.map((row) => row.portId))];
    const ports = await this.cruisePortsRepository.find({
      where: { id: In(portIds), deletedAt: IsNull() },
    });
    const portById = new Map(ports.map((port) => [port.id, port]));

    return portRows.map((row, index) => {
      const port = portById.get(row.portId);
      const portLabel = port?.name ?? row.portId.slice(0, 8);
      const detailParts = [
        `${copy.day} ${row.dayNumber}`,
        row.arrivalTime ? `${copy.arrival} ${row.arrivalTime}` : null,
        row.departureTime ? `${copy.departure} ${row.departureTime}` : null,
      ].filter(Boolean);

      return {
        order: index + 1,
        label: portLabel,
        detail: detailParts.length ? detailParts.join(' · ') : null,
      };
    });
  }
}
