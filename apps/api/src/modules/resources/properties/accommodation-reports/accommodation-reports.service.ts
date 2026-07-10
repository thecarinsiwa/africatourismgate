import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository, SelectQueryBuilder } from 'typeorm';
import { PLATFORM_ORG_ID } from '../../../../common/org-scope/org-scope.service';
import {
  Amenities,
  BookingItems,
  Bookings,
  Destinations,
  Organizations,
  Properties,
  PropertyAmenities,
  RoomAvailability,
  Rooms,
} from '../../../../entities/generated';
import { DEFAULT_EMAIL_BRANDING } from '../../../email/email-branding.constants';
import { resolveLogoForPdf } from '../../../email/email-attachments';
import { EmailBrandingService } from '../../../email/email-branding.service';
import { ACCOMMODATION_REPORT_MAX_DATE_RANGE_DAYS } from './accommodation-reports.constants';
import type {
  AccommodationPdfBrandingContext,
  AccommodationReportScope,
  ScopedPropertyRow,
} from './accommodation-reports.types';
import { AccommodationReportsDatedQueryDto } from './dto/accommodation-reports-dated-query.dto';
import { AccommodationReportsScopeQueryDto } from './dto/accommodation-reports-scope-query.dto';
import {
  buildAccommodationWorkbook,
  type AccommodationWorkbookAmenityRow,
  type AccommodationWorkbookAvailabilityRow,
  type AccommodationWorkbookRoomRow,
} from './excel/accommodation-workbook.builder';
import { resolveAccommodationReportLocale } from './labels/accommodation-reports.labels';
import { accommodationWorkbookFilename } from './labels/accommodation-workbook.labels';
import {
  bookingsPdfFilename,
  catalogPdfFilename,
  kpiSummaryPdfFilename,
  propertyDossierPdfFilename,
} from './labels/accommodation-pdf.labels';
import { renderBookingsPdf } from './pdf/bookings.renderer';
import { renderCatalogPdf } from './pdf/catalog.renderer';
import { renderKpiSummaryPdf } from './pdf/kpi-summary.renderer';
import { renderPropertyDossierPdf } from './pdf/property-dossier.renderer';

export type AccommodationReportFile = {
  buffer: Buffer;
  filename: string;
  contentType: string;
};

@Injectable()
export class AccommodationReportsService {
  constructor(
    @InjectRepository(Properties)
    private readonly propertiesRepository: Repository<Properties>,
    @InjectRepository(Destinations)
    private readonly destinationsRepository: Repository<Destinations>,
    @InjectRepository(Rooms)
    private readonly roomsRepository: Repository<Rooms>,
    @InjectRepository(RoomAvailability)
    private readonly roomAvailabilityRepository: Repository<RoomAvailability>,
    @InjectRepository(PropertyAmenities)
    private readonly propertyAmenitiesRepository: Repository<PropertyAmenities>,
    @InjectRepository(Amenities)
    private readonly amenitiesRepository: Repository<Amenities>,
    @InjectRepository(BookingItems)
    private readonly bookingItemsRepository: Repository<BookingItems>,
    @InjectRepository(Bookings)
    private readonly bookingsRepository: Repository<Bookings>,
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
    if (spanDays > ACCOMMODATION_REPORT_MAX_DATE_RANGE_DAYS) {
      throw new BadRequestException(
        `Date range must not exceed ${ACCOMMODATION_REPORT_MAX_DATE_RANGE_DAYS} days.`,
      );
    }
  }

  applyPropertyScope<T extends Properties>(
    qb: SelectQueryBuilder<T>,
    query: AccommodationReportsScopeQueryDto,
    alias = 'property',
  ): SelectQueryBuilder<T> {
    qb.where(`${alias}.deletedAt IS NULL`);

    const search = query.search?.trim();
    if (search) {
      qb.andWhere(`(${alias}.name LIKE :term OR ${alias}.slug LIKE :term)`, {
        term: `%${search}%`,
      });
    }

    if (query.destinationId) {
      qb.andWhere(`${alias}.destinationId = :destinationId`, {
        destinationId: query.destinationId,
      });
    }

    return qb;
  }

  async loadReportScope(
    query: AccommodationReportsScopeQueryDto,
  ): Promise<AccommodationReportScope> {
    const qb = this.applyPropertyScope(
      this.propertiesRepository.createQueryBuilder('property'),
      query,
    ).orderBy('property.name', 'ASC');

    const properties = await qb.getMany();
    const destinationNameById = await this.loadDestinationNameMap(
      properties.map((property) => property.destinationId),
    );

    const scopedProperties: ScopedPropertyRow[] = properties.map((property) => ({
      ...property,
      destinationName: destinationNameById.get(property.destinationId) ?? '',
    }));

    return {
      propertyIds: scopedProperties.map((property) => property.id),
      properties: scopedProperties,
    };
  }

  async resolvePdfBrandingContext(
    localeInput?: string | null,
  ): Promise<AccommodationPdfBrandingContext> {
    const locale = resolveAccommodationReportLocale(localeInput);
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

  async generateWorkbook(
    query: AccommodationReportsDatedQueryDto,
  ): Promise<AccommodationReportFile> {
    this.assertValidDateRange(query.dateFrom, query.dateTo);

    const locale = resolveAccommodationReportLocale(query.locale);
    const scope = await this.loadReportScope(query);
    const [rooms, availability, amenities] = await Promise.all([
      this.loadScopedRooms(scope.propertyIds),
      this.loadScopedAvailability(scope.propertyIds, query.dateFrom, query.dateTo),
      this.loadScopedAmenities(scope.propertyIds),
    ]);

    const buffer = await buildAccommodationWorkbook({
      locale,
      properties: scope.properties,
      rooms,
      availability,
      amenities,
    });

    return {
      buffer,
      filename: accommodationWorkbookFilename(query.dateFrom, query.dateTo),
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }

  async generateKpiSummaryPdf(
    query: AccommodationReportsScopeQueryDto,
  ): Promise<AccommodationReportFile> {
    const [scope, branding] = await Promise.all([
      this.loadReportScope(query),
      this.resolvePdfBrandingContext(query.locale),
    ]);
    const data = await this.loadKpiSummary(scope);
    const buffer = await renderKpiSummaryPdf({ ...branding, data });

    return {
      buffer,
      filename: kpiSummaryPdfFilename(),
      contentType: 'application/pdf',
    };
  }

  async generateCatalogPdf(
    query: AccommodationReportsScopeQueryDto,
  ): Promise<AccommodationReportFile> {
    const [scope, branding] = await Promise.all([
      this.loadReportScope(query),
      this.resolvePdfBrandingContext(query.locale),
    ]);
    const rows = await this.loadCatalogPdfRows(scope);
    const buffer = await renderCatalogPdf({ ...branding, rows });

    return {
      buffer,
      filename: catalogPdfFilename(),
      contentType: 'application/pdf',
    };
  }

  async generateBookingsPdf(
    query: AccommodationReportsDatedQueryDto,
  ): Promise<AccommodationReportFile> {
    this.assertValidDateRange(query.dateFrom, query.dateTo);

    const [scope, branding] = await Promise.all([
      this.loadReportScope(query),
      this.resolvePdfBrandingContext(query.locale),
    ]);
    const rows = await this.loadScopedBookingRows(
      scope.propertyIds,
      query.dateFrom,
      query.dateTo,
    );
    const buffer = await renderBookingsPdf({
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

  async generatePropertyDossierPdf(
    propertyId: string,
    localeInput?: string | null,
  ): Promise<AccommodationReportFile> {
    const property = await this.propertiesRepository.findOne({
      where: { id: propertyId, deletedAt: IsNull() },
    });
    if (!property) {
      throw new NotFoundException(`Property ${propertyId} not found.`);
    }

    const [branding, destinationNameById, rooms, amenities] = await Promise.all([
      this.resolvePdfBrandingContext(localeInput),
      this.loadDestinationNameMap([property.destinationId]),
      this.loadPropertyDossierRooms(propertyId),
      this.loadPropertyDossierAmenities(propertyId),
    ]);

    const scopedProperty: ScopedPropertyRow = {
      ...property,
      destinationName: destinationNameById.get(property.destinationId) ?? '',
    };

    const buffer = await renderPropertyDossierPdf({
      ...branding,
      property: scopedProperty,
      rooms,
      amenities,
    });

    return {
      buffer,
      filename: propertyDossierPdfFilename(property.slug),
      contentType: 'application/pdf',
    };
  }

  private async loadKpiSummary(scope: AccommodationReportScope) {
    const propertyIds = scope.propertyIds;
    const byTypeMap = new Map<string, number>();

    for (const property of scope.properties) {
      byTypeMap.set(property.propertyType, (byTypeMap.get(property.propertyType) ?? 0) + 1);
    }

    if (propertyIds.length === 0) {
      return {
        propertiesCount: 0,
        roomsCount: 0,
        amenitiesCount: 0,
        destinationsCount: 0,
        byPropertyType: [],
      };
    }

    const [roomsCount, amenitiesCount] = await Promise.all([
      this.roomsRepository
        .createQueryBuilder('room')
        .where('room.deletedAt IS NULL')
        .andWhere('room.propertyId IN (:...propertyIds)', { propertyIds })
        .getCount(),
      this.propertyAmenitiesRepository
        .createQueryBuilder('propertyAmenity')
        .innerJoin(
          Amenities,
          'amenity',
          'amenity.id = propertyAmenity.amenityId AND amenity.deletedAt IS NULL',
        )
        .where('propertyAmenity.deletedAt IS NULL')
        .andWhere('propertyAmenity.propertyId IN (:...propertyIds)', { propertyIds })
        .select('COUNT(DISTINCT amenity.id)', 'count')
        .getRawOne<{ count: string }>(),
    ]);

    return {
      propertiesCount: scope.properties.length,
      roomsCount,
      amenitiesCount: Number(amenitiesCount?.count ?? 0),
      destinationsCount: new Set(scope.properties.map((property) => property.destinationId)).size,
      byPropertyType: [...byTypeMap.entries()]
        .map(([propertyType, count]) => ({ propertyType, count }))
        .sort((a, b) => a.propertyType.localeCompare(b.propertyType)),
    };
  }

  private async loadCatalogPdfRows(scope: AccommodationReportScope) {
    if (scope.propertyIds.length === 0) {
      return [];
    }

    const roomCounts = await this.roomsRepository
      .createQueryBuilder('room')
      .select('room.propertyId', 'propertyId')
      .addSelect('COUNT(room.id)', 'roomCount')
      .where('room.deletedAt IS NULL')
      .andWhere('room.propertyId IN (:...propertyIds)', { propertyIds: scope.propertyIds })
      .groupBy('room.propertyId')
      .getRawMany<{ propertyId: string; roomCount: string }>();

    const roomCountByPropertyId = new Map(
      roomCounts.map((row) => [row.propertyId, Number(row.roomCount)]),
    );

    return scope.properties.map((property) => ({
      name: property.name,
      propertyType: property.propertyType,
      destinationName: property.destinationName,
      starRating: property.starRating,
      roomCount: roomCountByPropertyId.get(property.id) ?? 0,
    }));
  }

  private async loadScopedBookingRows(
    propertyIds: string[],
    dateFrom: string,
    dateTo: string,
  ) {
    if (propertyIds.length === 0) {
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
        Rooms,
        'room',
        'room.id = item.referenceId AND room.deletedAt IS NULL',
      )
      .innerJoin(
        Properties,
        'property',
        'property.id = room.propertyId AND property.deletedAt IS NULL',
      )
      .where('item.deletedAt IS NULL')
      .andWhere('item.itemType = :itemType', { itemType: 'room' })
      .andWhere('room.propertyId IN (:...propertyIds)', { propertyIds })
      .andWhere('item.startDate IS NOT NULL')
      .andWhere('item.startDate <= :dateTo', { dateTo: to })
      .andWhere('COALESCE(item.endDate, item.startDate) >= :dateFrom', { dateFrom: from })
      .select('booking.id', 'bookingId')
      .addSelect('booking.status', 'bookingStatus')
      .addSelect('booking.currency', 'currency')
      .addSelect('property.name', 'propertyName')
      .addSelect('room.name', 'roomName')
      .addSelect('MIN(item.startDate)', 'stayFrom')
      .addSelect('MAX(COALESCE(item.endDate, item.startDate))', 'stayTo')
      .addSelect('SUM(item.quantity * item.unitPriceCents)', 'lineTotalCents')
      .groupBy('booking.id')
      .addGroupBy('booking.status')
      .addGroupBy('booking.currency')
      .addGroupBy('property.name')
      .addGroupBy('room.name')
      .addGroupBy('item.referenceId')
      .orderBy('stayFrom', 'ASC')
      .addOrderBy('property.name', 'ASC')
      .getRawMany<{
        bookingId: string;
        bookingStatus: string;
        currency: string;
        propertyName: string;
        roomName: string;
        stayFrom: string;
        stayTo: string;
        lineTotalCents: string;
      }>();

    return rows.map((row) => ({
      bookingId: row.bookingId,
      bookingStatus: row.bookingStatus,
      propertyName: row.propertyName,
      roomName: row.roomName,
      stayFrom: String(row.stayFrom).slice(0, 10),
      stayTo: String(row.stayTo).slice(0, 10),
      lineTotalCents: Number(row.lineTotalCents),
      currency: row.currency,
    }));
  }

  private async loadPropertyDossierRooms(propertyId: string) {
    const rooms = await this.roomsRepository.find({
      where: { propertyId, deletedAt: IsNull() },
      order: { name: 'ASC' },
    });

    return rooms.map((room) => ({
      name: room.name,
      roomType: room.roomType,
      maxGuests: room.maxGuests,
      basePriceCents: room.basePriceCents,
      currency: room.currency,
    }));
  }

  private async loadPropertyDossierAmenities(propertyId: string) {
    const rows = await this.propertyAmenitiesRepository
      .createQueryBuilder('propertyAmenity')
      .innerJoin(
        Amenities,
        'amenity',
        'amenity.id = propertyAmenity.amenityId AND amenity.deletedAt IS NULL',
      )
      .where('propertyAmenity.deletedAt IS NULL')
      .andWhere('propertyAmenity.propertyId = :propertyId', { propertyId })
      .orderBy('amenity.name', 'ASC')
      .select('amenity.code', 'code')
      .addSelect('amenity.name', 'name')
      .getRawMany<{ code: string; name: string }>();

    return rows.map((row) => ({
      code: row.code,
      name: row.name,
    }));
  }

  private async loadScopedRooms(
    propertyIds: string[],
  ): Promise<AccommodationWorkbookRoomRow[]> {
    if (propertyIds.length === 0) {
      return [];
    }

    const rows = await this.roomsRepository
      .createQueryBuilder('room')
      .innerJoin(
        Properties,
        'property',
        'property.id = room.propertyId AND property.deletedAt IS NULL',
      )
      .where('room.deletedAt IS NULL')
      .andWhere('room.propertyId IN (:...propertyIds)', { propertyIds })
      .orderBy('property.name', 'ASC')
      .addOrderBy('room.name', 'ASC')
      .select('property.name', 'propertyName')
      .addSelect('room.id', 'roomId')
      .addSelect('room.name', 'name')
      .addSelect('room.roomType', 'roomType')
      .addSelect('room.maxGuests', 'maxGuests')
      .addSelect('room.bedConfig', 'bedConfig')
      .addSelect('room.basePriceCents', 'basePriceCents')
      .addSelect('room.currency', 'currency')
      .getRawMany<{
        propertyName: string;
        roomId: string;
        name: string;
        roomType: string | null;
        maxGuests: number;
        bedConfig: string | null;
        basePriceCents: number;
        currency: string;
      }>();

    return rows.map((row) => ({
      propertyName: row.propertyName,
      roomId: row.roomId,
      name: row.name,
      roomType: row.roomType,
      maxGuests: Number(row.maxGuests),
      bedConfig: row.bedConfig,
      basePrice: Number(row.basePriceCents),
      currency: row.currency,
    }));
  }

  private async loadScopedAvailability(
    propertyIds: string[],
    dateFrom: string,
    dateTo: string,
  ): Promise<AccommodationWorkbookAvailabilityRow[]> {
    if (propertyIds.length === 0) {
      return [];
    }

    const from = dateFrom.slice(0, 10);
    const to = dateTo.slice(0, 10);

    const rows = await this.roomAvailabilityRepository
      .createQueryBuilder('availability')
      .innerJoin(
        Rooms,
        'room',
        'room.id = availability.roomId AND room.deletedAt IS NULL',
      )
      .innerJoin(
        Properties,
        'property',
        'property.id = room.propertyId AND property.deletedAt IS NULL',
      )
      .where('availability.deletedAt IS NULL')
      .andWhere('room.propertyId IN (:...propertyIds)', { propertyIds })
      .andWhere('availability.date >= :dateFrom', { dateFrom: from })
      .andWhere('availability.date <= :dateTo', { dateTo: to })
      .orderBy('property.name', 'ASC')
      .addOrderBy('room.name', 'ASC')
      .addOrderBy('availability.date', 'ASC')
      .select('property.name', 'propertyName')
      .addSelect('room.name', 'roomName')
      .addSelect('availability.date', 'date')
      .addSelect('availability.availableUnits', 'availableUnits')
      .addSelect('availability.priceCents', 'priceCents')
      .addSelect('room.currency', 'currency')
      .getRawMany<{
        propertyName: string;
        roomName: string;
        date: string;
        availableUnits: number;
        priceCents: number;
        currency: string;
      }>();

    return rows.map((row) => ({
      propertyName: row.propertyName,
      roomName: row.roomName,
      date: String(row.date).slice(0, 10),
      availableUnits: Number(row.availableUnits),
      price: Number(row.priceCents),
      currency: row.currency,
    }));
  }

  private async loadScopedAmenities(
    propertyIds: string[],
  ): Promise<AccommodationWorkbookAmenityRow[]> {
    if (propertyIds.length === 0) {
      return [];
    }

    const rows = await this.propertyAmenitiesRepository
      .createQueryBuilder('propertyAmenity')
      .innerJoin(
        Amenities,
        'amenity',
        'amenity.id = propertyAmenity.amenityId AND amenity.deletedAt IS NULL',
      )
      .innerJoin(
        Properties,
        'property',
        'property.id = propertyAmenity.propertyId AND property.deletedAt IS NULL',
      )
      .where('propertyAmenity.deletedAt IS NULL')
      .andWhere('propertyAmenity.propertyId IN (:...propertyIds)', { propertyIds })
      .orderBy('property.name', 'ASC')
      .addOrderBy('amenity.name', 'ASC')
      .select('property.name', 'propertyName')
      .addSelect('amenity.code', 'code')
      .addSelect('amenity.name', 'name')
      .getRawMany<{
        propertyName: string;
        code: string;
        name: string;
      }>();

    return rows.map((row) => ({
      propertyName: row.propertyName,
      code: row.code,
      name: row.name,
    }));
  }

  private async loadDestinationNameMap(destinationIds: string[]): Promise<Map<string, string>> {
    const uniqueIds = [...new Set(destinationIds.filter(Boolean))];
    if (uniqueIds.length === 0) {
      return new Map();
    }

    const destinations = await this.destinationsRepository
      .createQueryBuilder('destination')
      .where('destination.id IN (:...ids)', { ids: uniqueIds })
      .andWhere('destination.deletedAt IS NULL')
      .getMany();

    return new Map(destinations.map((destination) => [destination.id, destination.name]));
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
