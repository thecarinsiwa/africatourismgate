import {
  BadRequestException,
  Injectable,
  NotFoundException,
  NotImplementedException,
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
    await this.loadReportScope(query);
    await this.resolvePdfBrandingContext(query.locale);
    throw new NotImplementedException('KPI summary PDF export is not implemented yet.');
  }

  async generateCatalogPdf(
    query: AccommodationReportsScopeQueryDto,
  ): Promise<AccommodationReportFile> {
    await this.loadReportScope(query);
    await this.resolvePdfBrandingContext(query.locale);
    throw new NotImplementedException('Catalog PDF export is not implemented yet.');
  }

  async generateBookingsPdf(
    query: AccommodationReportsDatedQueryDto,
  ): Promise<AccommodationReportFile> {
    this.assertValidDateRange(query.dateFrom, query.dateTo);
    await this.loadReportScope(query);
    await this.resolvePdfBrandingContext(query.locale);
    throw new NotImplementedException('Bookings PDF export is not implemented yet.');
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

    await this.resolvePdfBrandingContext(localeInput);
    throw new NotImplementedException('Property dossier PDF export is not implemented yet.');
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
