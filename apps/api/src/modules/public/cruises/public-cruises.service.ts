import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, In, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import {
  CabinAvailability,
  Cabins,
  CruiseLines,
  CruisePorts,
  CruiseSailings,
  Itineraries,
  ItineraryPorts,
  Ships,
} from '../../../entities/generated';
import { CruiseSearchQueryDto } from './dto/cruise-search-query.dto';
import { CruiseSearchResultDto } from './dto/cruise-search-result.dto';
import { CruiseSailingDetailQueryDto } from './dto/cruise-sailing-detail-query.dto';
import {
  CruiseSailingDetailDto,
  CruiseSailingDetailPortDto,
} from './dto/cruise-sailing-detail.dto';
import {
  assertValidCruiseSearchDates,
  computeReturnDate,
} from './cruise-dates.util';

type PortSummary = {
  id: string;
  code: string;
  name: string;
  countryCode: string;
};

type CabinOffer = CruiseSailingDetailDto['cabins'][number];

@Injectable()
export class PublicCruisesService {
  constructor(
    @InjectRepository(CruiseSailings)
    private readonly sailingsRepository: Repository<CruiseSailings>,
    @InjectRepository(Itineraries)
    private readonly itinerariesRepository: Repository<Itineraries>,
    @InjectRepository(ItineraryPorts)
    private readonly itineraryPortsRepository: Repository<ItineraryPorts>,
    @InjectRepository(CruisePorts)
    private readonly portsRepository: Repository<CruisePorts>,
    @InjectRepository(Ships)
    private readonly shipsRepository: Repository<Ships>,
    @InjectRepository(CruiseLines)
    private readonly cruiseLinesRepository: Repository<CruiseLines>,
    @InjectRepository(Cabins)
    private readonly cabinsRepository: Repository<Cabins>,
    @InjectRepository(CabinAvailability)
    private readonly cabinAvailabilityRepository: Repository<CabinAvailability>,
  ) {}

  async search(
    query: CruiseSearchQueryDto,
  ): Promise<PaginatedResult<CruiseSearchResultDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const guests = query.guests ?? 1;

    assertValidCruiseSearchDates(query.startDate, query.endDate);

    const sailFromCode = query.sailFrom?.trim().toUpperCase();
    const sailToCode = query.sailTo?.trim().toUpperCase();
    const hasFrom = Boolean(sailFromCode);
    const hasTo = Boolean(sailToCode);
    const hasDates = Boolean(query.startDate && query.endDate);

    const fromPort = hasFrom
      ? await this.findPortByCode(sailFromCode!)
      : null;
    const toPort = hasTo ? await this.findPortByCode(sailToCode!) : null;

    if (hasFrom && !fromPort) {
      return this.emptyPage(page, limit);
    }
    if (hasTo && !toPort) {
      return this.emptyPage(page, limit);
    }

    let itineraryIds: string[] | undefined;
    if (hasFrom && hasTo) {
      itineraryIds = await this.resolveItineraryIdsForRoute(
        fromPort!.id,
        toPort!.id,
      );
      if (!itineraryIds.length) {
        return this.emptyPage(page, limit);
      }
    }

    const sailingWhere: FindOptionsWhere<CruiseSailings> = {};
    if (itineraryIds?.length) {
      sailingWhere.itineraryId = In(itineraryIds);
    }
    if (hasDates) {
      sailingWhere.departureDate = Between(query.startDate!, query.endDate!);
    }

    const sailings = await this.sailingsRepository.find({
      where: Object.keys(sailingWhere).length ? sailingWhere : undefined,
      order: { departureDate: 'ASC' },
    });
    const activeSailings = sailings.filter((s) => !s.deletedAt);
    if (!activeSailings.length) {
      return this.emptyPage(page, limit);
    }

    const itineraries = await this.itinerariesRepository.find({
      where: { id: In([...new Set(activeSailings.map((s) => s.itineraryId))]) },
    });
    const itineraryById = new Map(
      itineraries.filter((i) => !i.deletedAt).map((i) => [i.id, i]),
    );

    const portsByItineraryId = await this.loadItineraryPortsByItineraryIds([
      ...itineraryById.keys(),
    ]);

    const shipIds = [...new Set(itineraries.map((i) => i.shipId))];
    const ships =
      shipIds.length > 0
        ? await this.shipsRepository.find({ where: { id: In(shipIds) } })
        : [];
    const shipById = new Map(
      ships.filter((s) => !s.deletedAt).map((s) => [s.id, s]),
    );

    const lineIds = [...new Set(ships.map((s) => s.cruiseLineId))];
    const lines =
      lineIds.length > 0
        ? await this.cruiseLinesRepository.find({ where: { id: In(lineIds) } })
        : [];
    const lineById = new Map(
      lines.filter((l) => !l.deletedAt).map((l) => [l.id, l]),
    );

    const results: CruiseSearchResultDto[] = [];

    for (const sailing of activeSailings) {
      const itinerary = itineraryById.get(sailing.itineraryId);
      if (!itinerary) continue;

      const itineraryPorts = portsByItineraryId.get(itinerary.id) ?? [];
      if (!itineraryPorts.length) continue;

      const endpoints = this.resolveItineraryEndpoints(itineraryPorts);
      if (hasFrom && !hasTo && endpoints.from.portCode !== fromPort!.code) {
        continue;
      }
      if (hasTo && !hasFrom && endpoints.to.portCode !== toPort!.code) {
        continue;
      }

      const ship = shipById.get(itinerary.shipId);
      if (!ship) continue;

      const line = lineById.get(ship.cruiseLineId);
      if (!line) continue;

      const cabinOffers = await this.buildCabinOffers(sailing.id, guests, {
        includeUnavailable: false,
      });
      if (!cabinOffers.length) continue;

      const minPriceCents = Math.min(...cabinOffers.map((o) => o.priceCents));
      const currency = cabinOffers[0].currency;
      const departureDate = this.normalizeDate(sailing.departureDate);

      results.push({
        id: sailing.id,
        departureDate,
        returnDate: computeReturnDate(departureDate, itinerary.durationNights),
        itineraryName: itinerary.name,
        shipName: ship.name,
        cruiseLineName: line.name,
        sailFromPortCode: endpoints.from.portCode,
        sailFromPortName: endpoints.from.portName,
        sailToPortCode: endpoints.to.portCode,
        sailToPortName: endpoints.to.portName,
        durationNights: itinerary.durationNights,
        minPriceCents,
        currency,
      });
    }

    results.sort((a, b) => a.minPriceCents - b.minPriceCents);

    const total = results.length;
    const offset = (page - 1) * limit;
    const data = results.slice(offset, offset + limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getSailingById(
    id: string,
    query: CruiseSailingDetailQueryDto,
  ): Promise<CruiseSailingDetailDto> {
    const guests = query.guests ?? 1;

    const sailing = await this.sailingsRepository.findOne({ where: { id } });
    if (!sailing || sailing.deletedAt) {
      throw new NotFoundException('Croisière introuvable.');
    }

    const itinerary = await this.itinerariesRepository.findOne({
      where: { id: sailing.itineraryId },
    });
    if (!itinerary || itinerary.deletedAt) {
      throw new NotFoundException('Croisière introuvable.');
    }

    const ship = await this.shipsRepository.findOne({
      where: { id: itinerary.shipId },
    });
    if (!ship || ship.deletedAt) {
      throw new NotFoundException('Croisière introuvable.');
    }

    const line = await this.cruiseLinesRepository.findOne({
      where: { id: ship.cruiseLineId },
    });
    if (!line || line.deletedAt) {
      throw new NotFoundException('Croisière introuvable.');
    }

    const itineraryPorts = await this.loadItineraryPorts(itinerary.id);
    if (!itineraryPorts.length) {
      throw new NotFoundException('Croisière introuvable.');
    }

    const cabins = await this.buildCabinOffers(sailing.id, guests, {
      includeUnavailable: true,
    });
    if (!cabins.length) {
      throw new NotFoundException(
        'Aucune cabine disponible pour cette croisière.',
      );
    }

    const inStockCabins = cabins.filter((c) => c.availableCount > 0);
    const minPriceCents = inStockCabins.length
      ? Math.min(...inStockCabins.map((c) => c.priceCents))
      : Math.min(...cabins.map((c) => c.priceCents));
    const departureDate = this.normalizeDate(sailing.departureDate);
    const endpoints = this.resolveItineraryEndpoints(itineraryPorts);

    return {
      id: sailing.id,
      departureDate,
      returnDate: computeReturnDate(departureDate, itinerary.durationNights),
      durationNights: itinerary.durationNights,
      itineraryName: itinerary.name,
      shipName: ship.name,
      cruiseLineName: line.name,
      sailFromPortCode: endpoints.from.portCode,
      sailFromPortName: endpoints.from.portName,
      sailToPortCode: endpoints.to.portCode,
      sailToPortName: endpoints.to.portName,
      minPriceCents,
      currency: cabins[0].currency,
      itineraryPorts,
      cabins,
    };
  }

  private async findPortByCode(code: string): Promise<PortSummary | null> {
    const row = await this.portsRepository.findOne({
      where: { code: code.toUpperCase() },
    });
    if (!row || row.deletedAt) {
      return null;
    }
    return {
      id: row.id,
      code: row.code,
      name: row.name,
      countryCode: row.countryCode,
    };
  }

  private async resolveItineraryIdsForRoute(
    fromPortId: string,
    toPortId: string,
  ): Promise<string[]> {
    const rows = await this.itineraryPortsRepository.find({
      where: { portId: In([fromPortId, toPortId]) },
    });

    const byItinerary = new Map<string, { fromDay?: number; toDay?: number }>();
    for (const row of rows) {
      if (row.deletedAt) continue;
      const entry = byItinerary.get(row.itineraryId) ?? {};
      if (row.portId === fromPortId) {
        entry.fromDay = row.dayNumber;
      }
      if (row.portId === toPortId) {
        entry.toDay = row.dayNumber;
      }
      byItinerary.set(row.itineraryId, entry);
    }

    const itineraryIds: string[] = [];
    for (const [itineraryId, days] of byItinerary) {
      if (
        days.fromDay !== undefined &&
        days.toDay !== undefined &&
        days.fromDay < days.toDay
      ) {
        itineraryIds.push(itineraryId);
      }
    }
    return itineraryIds;
  }

  private async buildCabinOffers(
    sailingId: string,
    guests: number,
    options: { includeUnavailable?: boolean } = {},
  ): Promise<CabinOffer[]> {
    const includeUnavailable = options.includeUnavailable ?? false;

    const availabilityRows = await this.cabinAvailabilityRepository.find({
      where: { sailingId },
    });
    const activeAvailability = availabilityRows.filter((row) => {
      if (row.deletedAt) return false;
      if (includeUnavailable) return true;
      return row.availableCount > 0;
    });
    if (!activeAvailability.length) {
      return [];
    }

    const cabinIds = [...new Set(activeAvailability.map((row) => row.cabinId))];
    const cabins = await this.cabinsRepository.find({
      where: { id: In(cabinIds) },
    });
    const cabinById = new Map(
      cabins
        .filter((cabin) => !cabin.deletedAt && cabin.maxGuests >= guests)
        .map((cabin) => [cabin.id, cabin]),
    );

    const offers: CabinOffer[] = [];
    for (const availability of activeAvailability) {
      const cabin = cabinById.get(availability.cabinId);
      if (!cabin) continue;

      offers.push({
        availabilityId: availability.id,
        cabinId: cabin.id,
        categoryName: cabin.categoryName,
        maxGuests: cabin.maxGuests,
        priceCents: availability.priceCents,
        availableCount: availability.availableCount,
        currency: cabin.currency,
      });
    }

    offers.sort((a, b) => a.priceCents - b.priceCents);
    return offers;
  }

  private async loadItineraryPortsByItineraryIds(
    itineraryIds: string[],
  ): Promise<Map<string, CruiseSailingDetailPortDto[]>> {
    const result = new Map<string, CruiseSailingDetailPortDto[]>();
    if (!itineraryIds.length) {
      return result;
    }

    for (const itineraryId of itineraryIds) {
      result.set(itineraryId, await this.loadItineraryPorts(itineraryId));
    }
    return result;
  }

  private async loadItineraryPorts(
    itineraryId: string,
  ): Promise<CruiseSailingDetailPortDto[]> {
    const stops = await this.itineraryPortsRepository.find({
      where: { itineraryId },
      order: { dayNumber: 'ASC' },
    });
    const activeStops = stops.filter((stop) => !stop.deletedAt);
    if (!activeStops.length) {
      return [];
    }

    const portIds = [...new Set(activeStops.map((stop) => stop.portId))];
    const ports = await this.portsRepository.find({
      where: { id: In(portIds) },
    });
    const portById = new Map(
      ports.filter((port) => !port.deletedAt).map((port) => [port.id, port]),
    );

    const result: CruiseSailingDetailPortDto[] = [];
    for (const stop of activeStops) {
      const port = portById.get(stop.portId);
      if (!port) continue;
      result.push({
        dayNumber: stop.dayNumber,
        portCode: port.code,
        portName: port.name,
        countryCode: port.countryCode,
        arrivalTime: stop.arrivalTime,
        departureTime: stop.departureTime,
      });
    }
    return result;
  }

  private resolveItineraryEndpoints(ports: CruiseSailingDetailPortDto[]): {
    from: { portCode: string; portName: string };
    to: { portCode: string; portName: string };
  } {
    const sorted = [...ports].sort((a, b) => a.dayNumber - b.dayNumber);
    const from = sorted[0];
    const to = sorted[sorted.length - 1];
    return {
      from: { portCode: from.portCode, portName: from.portName },
      to: { portCode: to.portCode, portName: to.portName },
    };
  }

  private normalizeDate(value: string | Date): string {
    if (value instanceof Date) {
      return value.toISOString().slice(0, 10);
    }
    return String(value).slice(0, 10);
  }

  private emptyPage(
    page: number,
    limit: number,
  ): PaginatedResult<CruiseSearchResultDto> {
    return {
      data: [],
      meta: { total: 0, page, limit, totalPages: 1 },
    };
  }
}
