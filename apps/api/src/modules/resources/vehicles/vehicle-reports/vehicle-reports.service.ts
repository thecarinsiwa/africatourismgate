import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository, SelectQueryBuilder } from 'typeorm';
import { PLATFORM_ORG_ID } from '../../../../common/org-scope/org-scope.service';
import {
  BookingItems,
  Bookings,
  Organizations,
  RentalAgencies,
  VehicleAvailability,
  VehicleCategories,
  Vehicles,
} from '../../../../entities/generated';
import { DEFAULT_EMAIL_BRANDING } from '../../../email/email-branding.constants';
import { resolveLogoForPdf } from '../../../email/email-attachments';
import { EmailBrandingService } from '../../../email/email-branding.service';
import { VEHICLE_REPORT_MAX_DATE_RANGE_DAYS } from './vehicle-reports.constants';
import type {
  ScopedVehicleRow,
  VehiclePdfBrandingContext,
  VehicleReportScope,
} from './vehicle-reports.types';
import { VehicleReportsDatedQueryDto } from './dto/vehicle-reports-dated-query.dto';
import { VehicleReportsScopeQueryDto } from './dto/vehicle-reports-scope-query.dto';
import {
  buildVehicleWorkbook,
  type VehicleWorkbookAvailabilityRow,
  type VehicleWorkbookCategoryRow,
} from './excel/vehicle-workbook.builder';
import { resolveVehicleReportLocale } from './labels/vehicle-reports.labels';
import { vehicleWorkbookFilename } from './labels/vehicle-workbook.labels';
import {
  bookingsPdfFilename,
  catalogPdfFilename,
  kpiSummaryPdfFilename,
} from './labels/vehicle-pdf.labels';
import { renderVehicleBookingsPdf } from './pdf/bookings.renderer';
import { renderVehicleCatalogPdf } from './pdf/catalog.renderer';
import { renderVehicleKpiSummaryPdf } from './pdf/kpi-summary.renderer';

export type VehicleReportFile = {
  buffer: Buffer;
  filename: string;
  contentType: string;
};

@Injectable()
export class VehicleReportsService {
  constructor(
    @InjectRepository(Vehicles)
    private readonly vehiclesRepository: Repository<Vehicles>,
    @InjectRepository(RentalAgencies)
    private readonly rentalAgenciesRepository: Repository<RentalAgencies>,
    @InjectRepository(VehicleCategories)
    private readonly vehicleCategoriesRepository: Repository<VehicleCategories>,
    @InjectRepository(VehicleAvailability)
    private readonly vehicleAvailabilityRepository: Repository<VehicleAvailability>,
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
    if (spanDays > VEHICLE_REPORT_MAX_DATE_RANGE_DAYS) {
      throw new BadRequestException(
        `Date range must not exceed ${VEHICLE_REPORT_MAX_DATE_RANGE_DAYS} days.`,
      );
    }
  }

  applyVehicleScope<T extends Vehicles>(
    qb: SelectQueryBuilder<T>,
    query: VehicleReportsScopeQueryDto,
    alias = 'vehicle',
  ): SelectQueryBuilder<T> {
    qb.where(`${alias}.deletedAt IS NULL`);

    const search = query.search?.trim();
    if (search) {
      qb.andWhere(`${alias}.licensePlate LIKE :term`, { term: `%${search}%` });
    }

    if (query.agencyId) {
      qb.andWhere(`${alias}.agencyId = :agencyId`, { agencyId: query.agencyId });
    }

    if (query.categoryId) {
      qb.andWhere(`${alias}.categoryId = :categoryId`, { categoryId: query.categoryId });
    }

    return qb;
  }

  async loadReportScope(query: VehicleReportsScopeQueryDto): Promise<VehicleReportScope> {
    const vehicles = await this.applyVehicleScope(
      this.vehiclesRepository.createQueryBuilder('vehicle'),
      query,
    )
      .orderBy('vehicle.licensePlate', 'ASC')
      .addOrderBy('vehicle.id', 'ASC')
      .getMany();

    const agencyById = await this.loadAgencyMap(vehicles.map((vehicle) => vehicle.agencyId));
    const categoryById = await this.loadCategoryMap(
      vehicles.map((vehicle) => vehicle.categoryId),
    );

    const scopedVehicles: ScopedVehicleRow[] = vehicles.map((vehicle) => {
      const agency = agencyById.get(vehicle.agencyId);
      const category = categoryById.get(vehicle.categoryId);

      return {
        ...vehicle,
        agencyName: agency?.name ?? '',
        categoryName: category?.name ?? '',
        categoryExampleModel: category?.exampleModel ?? '',
      };
    });

    return {
      vehicleIds: scopedVehicles.map((vehicle) => vehicle.id),
      vehicles: scopedVehicles,
    };
  }

  async resolvePdfBrandingContext(
    localeInput?: string | null,
  ): Promise<VehiclePdfBrandingContext> {
    const locale = resolveVehicleReportLocale(localeInput);
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

  async generateWorkbook(query: VehicleReportsDatedQueryDto): Promise<VehicleReportFile> {
    this.assertValidDateRange(query.dateFrom, query.dateTo);

    const locale = resolveVehicleReportLocale(query.locale);
    const scope = await this.loadReportScope(query);
    const [categories, availability] = await Promise.all([
      this.loadCategorySummaryRows(scope.vehicles),
      this.loadScopedAvailability(scope.vehicles, query.dateFrom, query.dateTo),
    ]);

    const buffer = await buildVehicleWorkbook({
      locale,
      vehicles: scope.vehicles,
      categories,
      availability,
    });

    return {
      buffer,
      filename: vehicleWorkbookFilename(query.dateFrom, query.dateTo),
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }

  async generateKpiSummaryPdf(query: VehicleReportsScopeQueryDto): Promise<VehicleReportFile> {
    const [scope, branding] = await Promise.all([
      this.loadReportScope(query),
      this.resolvePdfBrandingContext(query.locale),
    ]);
    const data = await this.loadKpiSummary(scope);
    const buffer = await renderVehicleKpiSummaryPdf({ ...branding, data });

    return {
      buffer,
      filename: kpiSummaryPdfFilename(),
      contentType: 'application/pdf',
    };
  }

  async generateCatalogPdf(query: VehicleReportsScopeQueryDto): Promise<VehicleReportFile> {
    const [scope, branding] = await Promise.all([
      this.loadReportScope(query),
      this.resolvePdfBrandingContext(query.locale),
    ]);
    const buffer = await renderVehicleCatalogPdf({
      ...branding,
      vehicles: scope.vehicles,
    });

    return {
      buffer,
      filename: catalogPdfFilename(),
      contentType: 'application/pdf',
    };
  }

  async generateBookingsPdf(query: VehicleReportsDatedQueryDto): Promise<VehicleReportFile> {
    this.assertValidDateRange(query.dateFrom, query.dateTo);

    const [scope, branding] = await Promise.all([
      this.loadReportScope(query),
      this.resolvePdfBrandingContext(query.locale),
    ]);
    const rows = await this.loadScopedBookingRows(scope.vehicleIds, query.dateFrom, query.dateTo);
    const buffer = await renderVehicleBookingsPdf({
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

  private async loadKpiSummary(scope: VehicleReportScope) {
    const byAgencyMap = new Map<string, number>();

    for (const vehicle of scope.vehicles) {
      const label = vehicle.agencyName || '—';
      byAgencyMap.set(label, (byAgencyMap.get(label) ?? 0) + 1);
    }

    if (scope.vehicleIds.length === 0) {
      return {
        vehiclesCount: 0,
        agenciesCount: 0,
        categoriesCount: 0,
        availabilitySlotsCount: 0,
        byAgency: [],
      };
    }

    const availabilitySlotsCount = await this.vehicleAvailabilityRepository
      .createQueryBuilder('availability')
      .where('availability.deletedAt IS NULL')
      .andWhere('availability.vehicleId IN (:...vehicleIds)', { vehicleIds: scope.vehicleIds })
      .getCount();

    const agencyIds = new Set(scope.vehicles.map((vehicle) => vehicle.agencyId));
    const categoryIds = new Set(scope.vehicles.map((vehicle) => vehicle.categoryId));

    return {
      vehiclesCount: scope.vehicles.length,
      agenciesCount: agencyIds.size,
      categoriesCount: categoryIds.size,
      availabilitySlotsCount,
      byAgency: [...byAgencyMap.entries()]
        .map(([agencyName, count]) => ({ agencyName, count }))
        .sort((a, b) => a.agencyName.localeCompare(b.agencyName)),
    };
  }

  private loadCategorySummaryRows(vehicles: ScopedVehicleRow[]): VehicleWorkbookCategoryRow[] {
    const grouped = new Map<
      string,
      { categoryName: string; exampleModel: string; totalCents: number; count: number }
    >();

    for (const vehicle of vehicles) {
      const key = vehicle.categoryId;
      const existing = grouped.get(key);
      if (existing) {
        existing.totalCents += vehicle.dailyPriceCents;
        existing.count += 1;
      } else {
        grouped.set(key, {
          categoryName: vehicle.categoryName,
          exampleModel: vehicle.categoryExampleModel,
          totalCents: vehicle.dailyPriceCents,
          count: 1,
        });
      }
    }

    return [...grouped.values()]
      .map((row) => ({
        categoryName: row.categoryName,
        exampleModel: row.exampleModel,
        vehicleCount: row.count,
        avgDailyPriceCents: Math.round(row.totalCents / row.count),
      }))
      .sort((a, b) => a.categoryName.localeCompare(b.categoryName));
  }

  private async loadScopedAvailability(
    vehicles: ScopedVehicleRow[],
    dateFrom: string,
    dateTo: string,
  ): Promise<VehicleWorkbookAvailabilityRow[]> {
    if (vehicles.length === 0) {
      return [];
    }

    const vehicleIds = vehicles.map((vehicle) => vehicle.id);
    const vehicleById = new Map(vehicles.map((vehicle) => [vehicle.id, vehicle]));
    const rangeStart = `${dateFrom.slice(0, 10)}T00:00:00.000Z`;
    const rangeEnd = `${dateTo.slice(0, 10)}T23:59:59.999Z`;

    const rows = await this.vehicleAvailabilityRepository
      .createQueryBuilder('availability')
      .where('availability.deletedAt IS NULL')
      .andWhere('availability.vehicleId IN (:...vehicleIds)', { vehicleIds })
      .andWhere('availability.startDatetime <= :rangeEnd', { rangeEnd })
      .andWhere('availability.endDatetime >= :rangeStart', { rangeStart })
      .orderBy('availability.startDatetime', 'ASC')
      .getMany();

    return rows.map((row) => {
      const vehicle = vehicleById.get(row.vehicleId);
      return {
        licensePlate: vehicle?.licensePlate ?? null,
        vehicleId: row.vehicleId,
        agencyName: vehicle?.agencyName ?? '',
        categoryName: vehicle?.categoryName ?? '',
        startDatetime: row.startDatetime.toISOString(),
        endDatetime: row.endDatetime.toISOString(),
        status: row.status,
      };
    });
  }

  private async loadScopedBookingRows(
    vehicleIds: string[],
    dateFrom: string,
    dateTo: string,
  ) {
    if (vehicleIds.length === 0) {
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
        VehicleAvailability,
        'availability',
        'availability.id = item.referenceId AND availability.deletedAt IS NULL',
      )
      .innerJoin(
        Vehicles,
        'vehicle',
        'vehicle.id = availability.vehicleId AND vehicle.deletedAt IS NULL',
      )
      .innerJoin(
        RentalAgencies,
        'agency',
        'agency.id = vehicle.agencyId AND agency.deletedAt IS NULL',
      )
      .where('item.deletedAt IS NULL')
      .andWhere('item.itemType = :itemType', { itemType: 'vehicle' })
      .andWhere('availability.vehicleId IN (:...vehicleIds)', { vehicleIds })
      .andWhere('item.startDate IS NOT NULL')
      .andWhere('item.startDate <= :dateTo', { dateTo: to })
      .andWhere('COALESCE(item.endDate, item.startDate) >= :dateFrom', { dateFrom: from })
      .select('booking.id', 'bookingId')
      .addSelect('booking.status', 'bookingStatus')
      .addSelect('booking.currency', 'currency')
      .addSelect('vehicle.id', 'vehicleId')
      .addSelect('vehicle.licensePlate', 'licensePlate')
      .addSelect('agency.name', 'agencyName')
      .addSelect('MIN(item.startDate)', 'pickupDate')
      .addSelect('SUM(item.quantity * item.unitPriceCents)', 'lineTotalCents')
      .groupBy('booking.id')
      .addGroupBy('booking.status')
      .addGroupBy('booking.currency')
      .addGroupBy('vehicle.id')
      .addGroupBy('vehicle.licensePlate')
      .addGroupBy('agency.name')
      .addGroupBy('item.referenceId')
      .orderBy('pickupDate', 'ASC')
      .addOrderBy('vehicle.licensePlate', 'ASC')
      .getRawMany<{
        bookingId: string;
        bookingStatus: string;
        currency: string;
        vehicleId: string;
        licensePlate: string | null;
        agencyName: string;
        pickupDate: string;
        lineTotalCents: string;
      }>();

    return rows.map((row) => ({
      bookingId: row.bookingId,
      bookingStatus: row.bookingStatus,
      vehicleId: row.vehicleId,
      licensePlate: row.licensePlate,
      agencyName: row.agencyName,
      pickupDate: String(row.pickupDate).slice(0, 10),
      lineTotalCents: Number(row.lineTotalCents),
      currency: row.currency,
    }));
  }

  private async loadAgencyMap(
    agencyIds: string[],
  ): Promise<Map<string, { name: string }>> {
    const uniqueIds = [...new Set(agencyIds.filter(Boolean))];
    if (uniqueIds.length === 0) {
      return new Map();
    }

    const agencies = await this.rentalAgenciesRepository
      .createQueryBuilder('agency')
      .where('agency.id IN (:...ids)', { ids: uniqueIds })
      .andWhere('agency.deletedAt IS NULL')
      .getMany();

    return new Map(agencies.map((agency) => [agency.id, { name: agency.name }]));
  }

  private async loadCategoryMap(
    categoryIds: string[],
  ): Promise<Map<string, { name: string; exampleModel: string | null }>> {
    const uniqueIds = [...new Set(categoryIds.filter(Boolean))];
    if (uniqueIds.length === 0) {
      return new Map();
    }

    const categories = await this.vehicleCategoriesRepository
      .createQueryBuilder('category')
      .where('category.id IN (:...ids)', { ids: uniqueIds })
      .andWhere('category.deletedAt IS NULL')
      .getMany();

    return new Map(
      categories.map((category) => [
        category.id,
        { name: category.name, exampleModel: category.exampleModel },
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
