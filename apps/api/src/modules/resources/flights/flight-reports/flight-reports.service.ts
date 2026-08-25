import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository, SelectQueryBuilder } from 'typeorm';
import { PLATFORM_ORG_ID } from '../../../../common/org-scope/org-scope.service';
import {
  Airlines,
  Airports,
  BookingItems,
  Bookings,
  FlightClassAvailability,
  FlightClasses,
  Flights,
  Organizations,
} from '../../../../entities/generated';
import { DEFAULT_EMAIL_BRANDING } from '../../../email/email-branding.constants';
import { resolveLogoForPdf } from '../../../email/email-attachments';
import { EmailBrandingService } from '../../../email/email-branding.service';
import { FLIGHT_REPORT_MAX_DATE_RANGE_DAYS } from './flight-reports.constants';
import type {
  FlightPdfBrandingContext,
  FlightReportScope,
  ScopedFlightRow,
} from './flight-reports.types';
import { FlightReportsDatedQueryDto } from './dto/flight-reports-dated-query.dto';
import { FlightReportsScopeQueryDto } from './dto/flight-reports-scope-query.dto';
import {
  buildFlightWorkbook,
  type FlightWorkbookAvailabilityRow,
  type FlightWorkbookClassRow,
} from './excel/flight-workbook.builder';
import { resolveFlightReportLocale } from './labels/flight-reports.labels';
import { flightWorkbookFilename } from './labels/flight-workbook.labels';
import {
  bookingsPdfFilename,
  catalogPdfFilename,
  flightDossierPdfFilename,
  kpiSummaryPdfFilename,
} from './labels/flight-pdf.labels';
import { renderFlightBookingsPdf } from './pdf/bookings.renderer';
import { renderFlightCatalogPdf } from './pdf/catalog.renderer';
import { renderFlightDossierPdf } from './pdf/flight-dossier.renderer';
import { renderFlightKpiSummaryPdf } from './pdf/kpi-summary.renderer';

export type FlightReportFile = {
  buffer: Buffer;
  filename: string;
  contentType: string;
};

@Injectable()
export class FlightReportsService {
  constructor(
    @InjectRepository(Flights)
    private readonly flightsRepository: Repository<Flights>,
    @InjectRepository(Airlines)
    private readonly airlinesRepository: Repository<Airlines>,
    @InjectRepository(Airports)
    private readonly airportsRepository: Repository<Airports>,
    @InjectRepository(FlightClasses)
    private readonly flightClassesRepository: Repository<FlightClasses>,
    @InjectRepository(FlightClassAvailability)
    private readonly flightClassAvailabilityRepository: Repository<FlightClassAvailability>,
  @InjectRepository(BookingItems)
  private readonly bookingItemsRepository: Repository<BookingItems>,
  @InjectRepository(Organizations)
    private readonly organizationsRepository: Repository<Organizations>,
    private readonly brandingService: EmailBrandingService,
  ) {}

  assertValidDateRange(dateFrom: string, dateTo: string): void {
    const from = this.parseDateOnly(dateFrom, 'dateFrom');
    const to = this.parseDateOnly(dateTo, 'dateTo');

    if (from > to) {
      throw new BadRequestException('dateFrom must be on or before dateTo.');
    }

    const dayMs = 24 * 60 * 60 * 1000;
    const spanDays = Math.floor((to.getTime() - from.getTime()) / dayMs) + 1;
    if (spanDays > FLIGHT_REPORT_MAX_DATE_RANGE_DAYS) {
      throw new BadRequestException(
        `Date range must not exceed ${FLIGHT_REPORT_MAX_DATE_RANGE_DAYS} days.`,
      );
    }
  }

  applyFlightScope<T extends Flights>(
    qb: SelectQueryBuilder<T>,
    query: FlightReportsScopeQueryDto,
    alias = 'flight',
  ): SelectQueryBuilder<T> {
    qb.where(`${alias}.deletedAt IS NULL`);

    const search = query.search?.trim();
    if (search) {
      qb.andWhere(`${alias}.flightNumber LIKE :term`, { term: `%${search}%` });
    }

    return qb;
  }

  async loadReportScope(query: FlightReportsScopeQueryDto): Promise<FlightReportScope> {
    const flights = await this.applyFlightScope(
      this.flightsRepository.createQueryBuilder('flight'),
      query,
    )
      .orderBy('flight.flightNumber', 'ASC')
      .getMany();

    const airlineNameById = await this.loadAirlineNameMap(
      flights.map((flight) => flight.airlineId),
    );
    const airportById = await this.loadAirportMap(
      flights.flatMap((flight) => [flight.departureAirportId, flight.arrivalAirportId]),
    );

    const scopedFlights: ScopedFlightRow[] = flights.map((flight) => {
      const airline = airlineNameById.get(flight.airlineId);
      const departure = airportById.get(flight.departureAirportId);
      const arrival = airportById.get(flight.arrivalAirportId);

      return {
        ...flight,
        airlineName: airline?.name ?? '',
        airlineIata: airline?.iataCode ?? '',
        departureAirportIata: departure?.iataCode ?? '',
        departureAirportCity: departure?.city ?? '',
        arrivalAirportIata: arrival?.iataCode ?? '',
        arrivalAirportCity: arrival?.city ?? '',
      };
    });

    return {
      flightIds: scopedFlights.map((flight) => flight.id),
      flights: scopedFlights,
    };
  }

  async resolvePdfBrandingContext(
    localeInput?: string | null,
  ): Promise<FlightPdfBrandingContext> {
    const locale = resolveFlightReportLocale(localeInput);
    const branding = await this.resolveBranding(PLATFORM_ORG_ID);
    const logoUrl = await this.resolveOrganizationLogoUrl(PLATFORM_ORG_ID, branding.logoUrl);
    const logoPath = await resolveLogoForPdf(logoUrl);

    return {
      locale,
      branding,
      logoPath,
      exportedAt: new Date(),
    };
  }

  async generateWorkbook(query: FlightReportsDatedQueryDto): Promise<FlightReportFile> {
    this.assertValidDateRange(query.dateFrom, query.dateTo);

    const locale = resolveFlightReportLocale(query.locale);
    const scope = await this.loadReportScope(query);
    const [classes, availability] = await Promise.all([
      this.loadScopedClasses(scope.flightIds),
      this.loadScopedAvailability(scope.flightIds, query.dateFrom, query.dateTo),
    ]);

    const buffer = await buildFlightWorkbook({
      locale,
      flights: scope.flights,
      classes,
      availability,
    });

    return {
      buffer,
      filename: flightWorkbookFilename(query.dateFrom, query.dateTo),
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }

  async generateKpiSummaryPdf(query: FlightReportsScopeQueryDto): Promise<FlightReportFile> {
    const [scope, branding] = await Promise.all([
      this.loadReportScope(query),
      this.resolvePdfBrandingContext(query.locale),
    ]);
    const data = await this.loadKpiSummary(scope);
    const buffer = await renderFlightKpiSummaryPdf({ ...branding, data });

    return {
      buffer,
      filename: kpiSummaryPdfFilename(),
      contentType: 'application/pdf',
    };
  }

  async generateCatalogPdf(query: FlightReportsScopeQueryDto): Promise<FlightReportFile> {
    const [scope, branding] = await Promise.all([
      this.loadReportScope(query),
      this.resolvePdfBrandingContext(query.locale),
    ]);
    const rows = await this.loadCatalogPdfRows(scope);
    const buffer = await renderFlightCatalogPdf({ ...branding, rows });

    return {
      buffer,
      filename: catalogPdfFilename(),
      contentType: 'application/pdf',
    };
  }

  async generateBookingsPdf(query: FlightReportsDatedQueryDto): Promise<FlightReportFile> {
    this.assertValidDateRange(query.dateFrom, query.dateTo);

    const [scope, branding] = await Promise.all([
      this.loadReportScope(query),
      this.resolvePdfBrandingContext(query.locale),
    ]);
    const rows = await this.loadScopedBookingRows(scope.flightIds, query.dateFrom, query.dateTo);
    const buffer = await renderFlightBookingsPdf({
      ...branding,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      rows,
    });

    return {
      buffer,
      filename: bookingsPdfFilename(query.dateFrom, query.dateTo),
      contentType: 'application/pdf',
    };
  }

  async generateFlightDossierPdf(
    flightId: string,
    localeInput?: string | null,
  ): Promise<FlightReportFile> {
    const flight = await this.flightsRepository.findOne({
      where: { id: flightId, deletedAt: IsNull() },
    });
    if (!flight) {
      throw new NotFoundException(`Flight ${flightId} not found.`);
    }

    const [branding, airlineNameById, airportById, classes] = await Promise.all([
      this.resolvePdfBrandingContext(localeInput),
      this.loadAirlineNameMap([flight.airlineId]),
      this.loadAirportMap([flight.departureAirportId, flight.arrivalAirportId]),
      this.loadFlightDossierClasses(flightId),
    ]);

    const airline = airlineNameById.get(flight.airlineId);
    const departure = airportById.get(flight.departureAirportId);
    const arrival = airportById.get(flight.arrivalAirportId);

    const scopedFlight: ScopedFlightRow = {
      ...flight,
      airlineName: airline?.name ?? '',
      airlineIata: airline?.iataCode ?? '',
      departureAirportIata: departure?.iataCode ?? '',
      departureAirportCity: departure?.city ?? '',
      arrivalAirportIata: arrival?.iataCode ?? '',
      arrivalAirportCity: arrival?.city ?? '',
    };

    const buffer = await renderFlightDossierPdf({
      ...branding,
      flight: scopedFlight,
      classes,
    });

    return {
      buffer,
      filename: flightDossierPdfFilename(flight.flightNumber),
      contentType: 'application/pdf',
    };
  }

  private async loadKpiSummary(scope: FlightReportScope) {
    const byAirlineMap = new Map<string, number>();

    for (const flight of scope.flights) {
      const label = flight.airlineName || flight.airlineIata || '—';
      byAirlineMap.set(label, (byAirlineMap.get(label) ?? 0) + 1);
    }

    if (scope.flightIds.length === 0) {
      return {
        flightsCount: 0,
        classesCount: 0,
        airlinesCount: 0,
        airportsCount: 0,
        byAirline: [],
      };
    }

    const classesCount = await this.flightClassesRepository
      .createQueryBuilder('flightClass')
      .where('flightClass.deletedAt IS NULL')
      .andWhere('flightClass.flightId IN (:...flightIds)', { flightIds: scope.flightIds })
      .getCount();

    const airportIds = new Set<string>();
    const airlineIds = new Set<string>();
    for (const flight of scope.flights) {
      airportIds.add(flight.departureAirportId);
      airportIds.add(flight.arrivalAirportId);
      airlineIds.add(flight.airlineId);
    }

    return {
      flightsCount: scope.flights.length,
      classesCount,
      airlinesCount: airlineIds.size,
      airportsCount: airportIds.size,
      byAirline: [...byAirlineMap.entries()]
        .map(([airlineName, count]) => ({ airlineName, count }))
        .sort((a, b) => a.airlineName.localeCompare(b.airlineName)),
    };
  }

  private async loadCatalogPdfRows(scope: FlightReportScope) {
    if (scope.flightIds.length === 0) {
      return [];
    }

    const classCounts = await this.flightClassesRepository
      .createQueryBuilder('flightClass')
      .select('flightClass.flightId', 'flightId')
      .addSelect('COUNT(flightClass.id)', 'classCount')
      .where('flightClass.deletedAt IS NULL')
      .andWhere('flightClass.flightId IN (:...flightIds)', { flightIds: scope.flightIds })
      .groupBy('flightClass.flightId')
      .getRawMany<{ flightId: string; classCount: string }>();

    const classCountByFlightId = new Map(
      classCounts.map((row) => [row.flightId, Number(row.classCount)]),
    );

    return scope.flights.map((flight) => ({
      flight,
      classCount: classCountByFlightId.get(flight.id) ?? 0,
    }));
  }

  private async loadScopedClasses(flightIds: string[]): Promise<FlightWorkbookClassRow[]> {
    if (flightIds.length === 0) {
      return [];
    }

    const rows = await this.flightClassesRepository
      .createQueryBuilder('flightClass')
      .innerJoin(
        Flights,
        'flight',
        'flight.id = flightClass.flightId AND flight.deletedAt IS NULL',
      )
      .where('flightClass.deletedAt IS NULL')
      .andWhere('flightClass.flightId IN (:...flightIds)', { flightIds })
      .orderBy('flight.flightNumber', 'ASC')
      .addOrderBy('flightClass.className', 'ASC')
      .select('flight.flightNumber', 'flightNumber')
      .addSelect('flightClass.className', 'className')
      .addSelect('flightClass.seatsTotal', 'seatsTotal')
      .addSelect('flightClass.basePriceCents', 'basePriceCents')
      .getRawMany<{
        flightNumber: string;
        className: string;
        seatsTotal: number;
        basePriceCents: number;
      }>();

    return rows.map((row) => ({
      flightNumber: row.flightNumber,
      className: row.className,
      seatsTotal: Number(row.seatsTotal),
      basePriceCents: Number(row.basePriceCents),
    }));
  }

  private async loadScopedAvailability(
    flightIds: string[],
    dateFrom: string,
    dateTo: string,
  ): Promise<FlightWorkbookAvailabilityRow[]> {
    if (flightIds.length === 0) {
      return [];
    }

    const from = dateFrom.slice(0, 10);
    const to = dateTo.slice(0, 10);

    const rows = await this.flightClassAvailabilityRepository
      .createQueryBuilder('availability')
      .innerJoin(
        FlightClasses,
        'flightClass',
        'flightClass.id = availability.flightClassId AND flightClass.deletedAt IS NULL',
      )
      .innerJoin(
        Flights,
        'flight',
        'flight.id = flightClass.flightId AND flight.deletedAt IS NULL',
      )
      .where('availability.deletedAt IS NULL')
      .andWhere('flightClass.flightId IN (:...flightIds)', { flightIds })
      .andWhere('availability.date >= :dateFrom', { dateFrom: from })
      .andWhere('availability.date <= :dateTo', { dateTo: to })
      .orderBy('flight.flightNumber', 'ASC')
      .addOrderBy('flightClass.className', 'ASC')
      .addOrderBy('availability.date', 'ASC')
      .select('flight.flightNumber', 'flightNumber')
      .addSelect('flightClass.className', 'className')
      .addSelect('availability.date', 'date')
      .addSelect('availability.availableSeats', 'availableSeats')
      .addSelect('availability.priceCents', 'priceCents')
      .getRawMany<{
        flightNumber: string;
        className: string;
        date: string;
        availableSeats: number;
        priceCents: number;
      }>();

    return rows.map((row) => ({
      flightNumber: row.flightNumber,
      className: row.className,
      date: String(row.date).slice(0, 10),
      availableSeats: Number(row.availableSeats),
      priceCents: Number(row.priceCents),
    }));
  }

  private async loadScopedBookingRows(
    flightIds: string[],
    dateFrom: string,
    dateTo: string,
  ) {
    if (flightIds.length === 0) {
      return [];
    }

    const from = dateFrom.slice(0, 10);
    const to = dateTo.slice(0, 10);

    const rows = await this.bookingItemsRepository
      .createQueryBuilder('item')
      .innerJoin(
        Bookings,
        'booking',
        'booking.id = item.bookingId AND booking.deletedAt IS NULL',
      )
      .innerJoin(
        FlightClasses,
        'flightClass',
        'flightClass.id = item.referenceId AND flightClass.deletedAt IS NULL',
      )
      .innerJoin(
        Flights,
        'flight',
        'flight.id = flightClass.flightId AND flight.deletedAt IS NULL',
      )
      .where('item.deletedAt IS NULL')
      .andWhere('item.itemType = :itemType', { itemType: 'flight_class' })
      .andWhere('flightClass.flightId IN (:...flightIds)', { flightIds })
      .andWhere('item.startDate IS NOT NULL')
      .andWhere('item.startDate <= :dateTo', { dateTo: to })
      .andWhere('COALESCE(item.endDate, item.startDate) >= :dateFrom', { dateFrom: from })
      .select('booking.id', 'bookingId')
      .addSelect('booking.status', 'bookingStatus')
      .addSelect('booking.currency', 'currency')
      .addSelect('flight.flightNumber', 'flightNumber')
      .addSelect('flightClass.className', 'className')
      .addSelect('MIN(item.startDate)', 'travelDate')
      .addSelect('SUM(item.quantity * item.unitPriceCents)', 'lineTotalCents')
      .groupBy('booking.id')
      .addGroupBy('booking.status')
      .addGroupBy('booking.currency')
      .addGroupBy('flight.flightNumber')
      .addGroupBy('flightClass.className')
      .addGroupBy('item.referenceId')
      .orderBy('travelDate', 'ASC')
      .addOrderBy('flight.flightNumber', 'ASC')
      .getRawMany<{
        bookingId: string;
        bookingStatus: string;
        currency: string;
        flightNumber: string;
        className: string;
        travelDate: string;
        lineTotalCents: string;
      }>();

    return rows.map((row) => ({
      bookingId: row.bookingId,
      bookingStatus: row.bookingStatus,
      flightNumber: row.flightNumber,
      className: row.className,
      travelDate: String(row.travelDate).slice(0, 10),
      lineTotalCents: Number(row.lineTotalCents),
      currency: row.currency,
    }));
  }

  private async loadFlightDossierClasses(flightId: string) {
    const classes = await this.flightClassesRepository.find({
      where: { flightId, deletedAt: IsNull() },
      order: { className: 'ASC' },
    });

    return classes.map((cabin) => ({
      className: cabin.className,
      seatsTotal: cabin.seatsTotal,
      basePriceCents: cabin.basePriceCents,
    }));
  }

  private async loadAirlineNameMap(
    airlineIds: string[],
  ): Promise<Map<string, { name: string; iataCode: string }>> {
    const uniqueIds = [...new Set(airlineIds.filter(Boolean))];
    if (uniqueIds.length === 0) {
      return new Map();
    }

    const airlines = await this.airlinesRepository
      .createQueryBuilder('airline')
      .where('airline.id IN (:...ids)', { ids: uniqueIds })
      .andWhere('airline.deletedAt IS NULL')
      .getMany();

    return new Map(
      airlines.map((airline) => [
        airline.id,
        { name: airline.name, iataCode: airline.iataCode },
      ]),
    );
  }

  private async loadAirportMap(
    airportIds: string[],
  ): Promise<Map<string, { iataCode: string; city: string }>> {
    const uniqueIds = [...new Set(airportIds.filter(Boolean))];
    if (uniqueIds.length === 0) {
      return new Map();
    }

    const airports = await this.airportsRepository
      .createQueryBuilder('airport')
      .where('airport.id IN (:...ids)', { ids: uniqueIds })
      .andWhere('airport.deletedAt IS NULL')
      .getMany();

    return new Map(
      airports.map((airport) => [
        airport.id,
        { iataCode: airport.iataCode, city: airport.city },
      ]),
    );
  }

  private parseDateOnly(value: string, field: string): Date {
    const match = /^(\d{4}-\d{2}-\d{2})/.exec(value.trim());
    if (!match) {
      throw new BadRequestException(`${field} must be a valid ISO date (YYYY-MM-DD).`);
    }

    const parsed = new Date(`${match[1]}T00:00:00.000Z`);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException(`${field} must be a valid ISO date (YYYY-MM-DD).`);
    }

    return parsed;
  }

  private async resolveBranding(organizationId: string) {
    try {
      return await this.brandingService.resolveForOrganization(organizationId);
    } catch {
      return DEFAULT_EMAIL_BRANDING;
    }
  }

  private async resolveOrganizationLogoUrl(
    organizationId: string,
    brandingLogoUrl?: string,
  ): Promise<string | undefined> {
    if (brandingLogoUrl?.trim()) {
      return brandingLogoUrl.trim();
    }

    const organization = await this.organizationsRepository.findOne({
      where: { id: organizationId, deletedAt: IsNull() },
    });
    const orgLogo = organization?.logoUrl?.trim();
    return orgLogo || undefined;
  }
}
