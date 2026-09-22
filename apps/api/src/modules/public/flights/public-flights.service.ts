import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { PublicSiteSearchHit } from '@africatourismgate/types';
import { In, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import {
  Airlines,
  Airports,
  FlightClassAvailability,
  FlightClasses,
  FlightImages,
  Flights,
} from '../../../entities/generated';
import { PublicGalleryImageDto } from '../dto/public-gallery-image.dto';
import {
  FLIGHT_SITE_SEARCH_WEIGHTS,
  scoreSiteSearchTextMatch,
} from '../site-search/site-search-scoring';
import { FlightDetailQueryDto } from './dto/flight-detail-query.dto';
import { FlightDetailDto } from './dto/flight-detail.dto';
import { FlightSearchQueryDto } from './dto/flight-search-query.dto';
import { FlightSearchResultDto } from './dto/flight-search-result.dto';
import { PublicAirportDto } from './dto/public-airport.dto';
import { assertValidFlightDates, todayDateOnly } from './flight-dates.util';

const DEFAULT_CURRENCY = 'USD';

type AirportSummary = {
  id: string;
  iataCode: string;
  name: string;
  city: string;
  countryCode: string;
};

@Injectable()
export class PublicFlightsService {
  constructor(
    @InjectRepository(Flights)
    private readonly flightsRepository: Repository<Flights>,
    @InjectRepository(FlightImages)
    private readonly flightImagesRepository: Repository<FlightImages>,
    @InjectRepository(FlightClasses)
    private readonly flightClassesRepository: Repository<FlightClasses>,
    @InjectRepository(FlightClassAvailability)
    private readonly availabilityRepository: Repository<FlightClassAvailability>,
    @InjectRepository(Airports)
    private readonly airportsRepository: Repository<Airports>,
    @InjectRepository(Airlines)
    private readonly airlinesRepository: Repository<Airlines>,
  ) {}

  async listAirports(): Promise<PublicAirportDto[]> {
    const rows = await this.airportsRepository
      .createQueryBuilder('a')
      .select(['a.iataCode', 'a.name', 'a.city', 'a.countryCode'])
      .where('a.deletedAt IS NULL')
      .orderBy('a.city', 'ASC')
      .addOrderBy('a.iataCode', 'ASC')
      .getMany();

    return rows.map((airport) => ({
      iataCode: airport.iataCode,
      name: airport.name,
      city: airport.city,
      countryCode: airport.countryCode,
    }));
  }

  async search(
    query: FlightSearchQueryDto,
  ): Promise<PaginatedResult<FlightSearchResultDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const passengers = query.passengers ?? 1;

    assertValidFlightDates(query.departureDate, query.returnDate);

    const fromAirport = query.from
      ? await this.findAirportByIata(query.from)
      : null;
    const toAirport = query.to ? await this.findAirportByIata(query.to) : null;

    if (query.from && !fromAirport) {
      return this.emptyPage(page, limit);
    }
    if (query.to && !toAirport) {
      return this.emptyPage(page, limit);
    }

    const flightWhere = {
      ...(fromAirport ? { departureAirportId: fromAirport.id } : {}),
      ...(toAirport ? { arrivalAirportId: toAirport.id } : {}),
      deletedAt: null as never,
    };

    const outboundFlights = await this.flightsRepository.find({
      where: flightWhere,
      order: { departureTime: 'ASC' },
    });

    const returnMinPrice =
      query.departureDate && query.returnDate && toAirport && fromAirport
        ? await this.computeRouteMinPrice(
            toAirport.id,
            fromAirport.id,
            query.returnDate,
            passengers,
          )
        : null;

    if (query.returnDate && returnMinPrice === null) {
      return this.emptyPage(page, limit);
    }

    const airportIds = [
      ...new Set(
        outboundFlights.flatMap((f) => [f.departureAirportId, f.arrivalAirportId]),
      ),
    ];
    const airports =
      airportIds.length > 0
        ? await this.airportsRepository.find({ where: { id: In(airportIds) } })
        : [];
    const airportById = new Map(
      airports.filter((a) => !a.deletedAt).map((a) => [a.id, a]),
    );

    const airlineIds = [...new Set(outboundFlights.map((f) => f.airlineId))];
    const airlines =
      airlineIds.length > 0
        ? await this.airlinesRepository.find({ where: { id: In(airlineIds) } })
        : [];
    const airlineById = new Map(
      airlines.filter((a) => !a.deletedAt).map((a) => [a.id, a]),
    );

    const flightIds = outboundFlights.filter((f) => !f.deletedAt).map((f) => f.id);
    const imageUrlByFlightId = await this.loadPrimaryImageUrlByFlightId(flightIds);

    const results: FlightSearchResultDto[] = [];

    for (const flight of outboundFlights) {
      if (flight.deletedAt) continue;

      const departureAirport = airportById.get(flight.departureAirportId);
      const arrivalAirport = airportById.get(flight.arrivalAirportId);
      if (!departureAirport || !arrivalAirport) continue;

      const travelDate =
        query.departureDate ??
        (await this.findEarliestAvailabilityForFlight(
          flight.id,
          passengers,
          todayDateOnly(),
        ));
      if (!travelDate) continue;

      const outboundMin = await this.computeFlightMinPrice(
        flight.id,
        travelDate,
        passengers,
      );
      if (outboundMin === null) continue;

      const airline = airlineById.get(flight.airlineId);
      if (!airline) continue;

      const minPriceCents = outboundMin + (returnMinPrice ?? 0);

      results.push({
        id: flight.id,
        flightNumber: flight.flightNumber,
        airlineName: airline.name,
        airlineIataCode: airline.iataCode,
        departureAirportIata: departureAirport.iataCode,
        departureAirportCity: departureAirport.city,
        arrivalAirportIata: arrivalAirport.iataCode,
        arrivalAirportCity: arrivalAirport.city,
        departureTime: flight.departureTime.toISOString(),
        arrivalTime: flight.arrivalTime.toISOString(),
        durationMinutes: flight.durationMinutes,
        minPriceCents,
        currency: DEFAULT_CURRENCY,
        roundTrip: Boolean(query.returnDate),
        departureDate: travelDate,
        imageUrl: imageUrlByFlightId.get(flight.id) ?? null,
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

  /**
   * Free-text catalogue search for site-search (no dates required).
   * Matches flight number, airline name/IATA, and airport IATA/name/city.
   */
  async searchCatalog(
    q: string,
    limit: number,
  ): Promise<PublicSiteSearchHit[]> {
    const term = q.trim().toLowerCase();
    if (!term || limit < 1) return [];

    const pattern = `%${term}%`;
    const fetchLimit = Math.min(Math.max(limit * 3, limit), 60);

    const flights = await this.flightsRepository
      .createQueryBuilder('f')
      .innerJoin(
        Airlines,
        'al',
        'al.id = f.airlineId AND al.deletedAt IS NULL',
      )
      .innerJoin(
        Airports,
        'dep',
        'dep.id = f.departureAirportId AND dep.deletedAt IS NULL',
      )
      .innerJoin(
        Airports,
        'arr',
        'arr.id = f.arrivalAirportId AND arr.deletedAt IS NULL',
      )
      .where('f.deletedAt IS NULL')
      .andWhere(
        `(LOWER(f.flightNumber) LIKE :pattern
          OR LOWER(al.name) LIKE :pattern
          OR LOWER(al.iataCode) LIKE :pattern
          OR LOWER(CONCAT(al.iataCode, f.flightNumber)) LIKE :pattern
          OR LOWER(dep.iataCode) LIKE :pattern
          OR LOWER(dep.name) LIKE :pattern
          OR LOWER(dep.city) LIKE :pattern
          OR LOWER(arr.iataCode) LIKE :pattern
          OR LOWER(arr.name) LIKE :pattern
          OR LOWER(arr.city) LIKE :pattern)`,
        { pattern },
      )
      .orderBy('f.flightNumber', 'ASC')
      .take(fetchLimit)
      .getMany();

    if (!flights.length) return [];

    const airlineIds = [...new Set(flights.map((f) => f.airlineId))];
    const airlines = await this.airlinesRepository.find({
      where: { id: In(airlineIds) },
    });
    const airlineById = new Map(
      airlines.filter((a) => !a.deletedAt).map((a) => [a.id, a] as const),
    );

    const airportIds = [
      ...new Set(
        flights.flatMap((f) => [f.departureAirportId, f.arrivalAirportId]),
      ),
    ];
    const airports = await this.airportsRepository.find({
      where: { id: In(airportIds) },
    });
    const airportById = new Map(
      airports.filter((a) => !a.deletedAt).map((a) => [a.id, a] as const),
    );

    const imageUrlByFlightId = await this.loadPrimaryImageUrlByFlightId(
      flights.map((f) => f.id),
    );

    const hits: PublicSiteSearchHit[] = [];

    for (const flight of flights) {
      const airline = airlineById.get(flight.airlineId);
      const dep = airportById.get(flight.departureAirportId);
      const arr = airportById.get(flight.arrivalAirportId);
      if (!airline || !dep || !arr) continue;

      const combinedNumber = `${airline.iataCode}${flight.flightNumber}`;
      const score = scoreSiteSearchTextMatch(term, [
        {
          weight: FLIGHT_SITE_SEARCH_WEIGHTS.flightNumber,
          value: flight.flightNumber,
        },
        {
          weight: FLIGHT_SITE_SEARCH_WEIGHTS.flightNumber,
          value: combinedNumber,
        },
        { weight: FLIGHT_SITE_SEARCH_WEIGHTS.airline, value: airline.name },
        { weight: FLIGHT_SITE_SEARCH_WEIGHTS.airline, value: airline.iataCode },
        { weight: FLIGHT_SITE_SEARCH_WEIGHTS.airport, value: dep.iataCode },
        { weight: FLIGHT_SITE_SEARCH_WEIGHTS.airport, value: dep.name },
        { weight: FLIGHT_SITE_SEARCH_WEIGHTS.airport, value: dep.city },
        { weight: FLIGHT_SITE_SEARCH_WEIGHTS.airport, value: arr.iataCode },
        { weight: FLIGHT_SITE_SEARCH_WEIGHTS.airport, value: arr.name },
        { weight: FLIGHT_SITE_SEARCH_WEIGHTS.airport, value: arr.city },
      ]);
      if (score <= 0) continue;

      hits.push({
        type: 'flights',
        id: flight.id,
        title: `${airline.iataCode} ${flight.flightNumber} · ${airline.name}`,
        subtitle: `${dep.city} (${dep.iataCode}) → ${arr.city} (${arr.iataCode})`,
        href: `/flights/${encodeURIComponent(flight.id)}`,
        imageUrl:
          imageUrlByFlightId.get(flight.id) ?? airline.logoUrl ?? null,
        score,
      });
    }

    hits.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
    return hits.slice(0, limit);
  }

  private emptyPage(
    page: number,
    limit: number,
  ): PaginatedResult<FlightSearchResultDto> {
    return {
      data: [],
      meta: { total: 0, page, limit, totalPages: 1 },
    };
  }

  private async findEarliestAvailabilityForFlight(
    flightId: string,
    passengers: number,
    minDate: string,
  ): Promise<string | null> {
    const classes = await this.flightClassesRepository.find({
      where: { flightId },
    });
    const activeClassIds = classes.filter((c) => !c.deletedAt).map((c) => c.id);
    if (!activeClassIds.length) {
      return null;
    }

    const availabilityRows = await this.availabilityRepository.find({
      where: { flightClassId: In(activeClassIds) },
      order: { date: 'ASC' },
    });

    const eligibleDates = availabilityRows
      .filter(
        (row) =>
          !row.deletedAt &&
          row.availableSeats >= passengers &&
          row.availableSeats > 0,
      )
      .map((row) => String(row.date).slice(0, 10))
      .filter((date) => date >= minDate)
      .sort();

    return eligibleDates[0] ?? null;
  }

  async getById(id: string, query: FlightDetailQueryDto): Promise<FlightDetailDto> {
    const passengers = query.passengers ?? 1;
    assertValidFlightDates(query.departureDate, query.returnDate);

    const flight = await this.flightsRepository.findOne({ where: { id } });
    if (!flight || flight.deletedAt) {
      throw new NotFoundException('Vol introuvable.');
    }

    const airline = await this.airlinesRepository.findOne({
      where: { id: flight.airlineId },
    });
    if (!airline || airline.deletedAt) {
      throw new NotFoundException('Vol introuvable.');
    }

    const [departureAirport, arrivalAirport] = await Promise.all([
      this.airportsRepository.findOne({ where: { id: flight.departureAirportId } }),
      this.airportsRepository.findOne({ where: { id: flight.arrivalAirportId } }),
    ]);
    if (
      !departureAirport ||
      departureAirport.deletedAt ||
      !arrivalAirport ||
      arrivalAirport.deletedAt
    ) {
      throw new NotFoundException('Vol introuvable.');
    }

    const classes = await this.buildClassOffers(
      flight.id,
      query.departureDate,
      passengers,
    );
    if (!classes.length) {
      throw new NotFoundException(
        'Aucune classe disponible pour cette date et ce nombre de passagers.',
      );
    }

    const minPriceCents = Math.min(...classes.map((c) => c.totalPriceCents));
    const images = await this.loadFlightGallery(flight.id);

    return {
      id: flight.id,
      flightNumber: flight.flightNumber,
      airlineName: airline.name,
      airlineIataCode: airline.iataCode,
      departureAirport: this.toAirportDto(departureAirport),
      arrivalAirport: this.toAirportDto(arrivalAirport),
      departureTime: flight.departureTime.toISOString(),
      arrivalTime: flight.arrivalTime.toISOString(),
      durationMinutes: flight.durationMinutes,
      departureDate: query.departureDate,
      returnDate: query.returnDate ?? null,
      passengers,
      minPriceCents,
      currency: DEFAULT_CURRENCY,
      classes,
      images,
    };
  }

  private async loadPrimaryImageUrlByFlightId(
    flightIds: string[],
  ): Promise<Map<string, string>> {
    if (!flightIds.length) {
      return new Map();
    }

    const rows = await this.flightImagesRepository.find({
      where: { flightId: In(flightIds) },
      order: { sortOrder: 'ASC' },
    });
    const imageUrlByFlightId = new Map<string, string>();
    for (const row of rows) {
      if (!row.deletedAt && !imageUrlByFlightId.has(row.flightId)) {
        imageUrlByFlightId.set(row.flightId, row.url);
      }
    }
    return imageUrlByFlightId;
  }

  private async loadFlightGallery(flightId: string): Promise<PublicGalleryImageDto[]> {
    const rows = await this.flightImagesRepository.find({
      where: { flightId },
      order: { sortOrder: 'ASC' },
    });
    return rows
      .filter((row) => !row.deletedAt)
      .map((row) => ({
        id: row.id,
        url: row.url,
        caption: row.caption ?? null,
        sortOrder: row.sortOrder,
      }));
  }

  private async findAirportByIata(iata: string): Promise<AirportSummary | null> {
    const row = await this.airportsRepository.findOne({
      where: { iataCode: iata.toUpperCase() },
    });
    if (!row || row.deletedAt) {
      return null;
    }
    return {
      id: row.id,
      iataCode: row.iataCode,
      name: row.name,
      city: row.city,
      countryCode: row.countryCode,
    };
  }

  private async computeRouteMinPrice(
    departureAirportId: string,
    arrivalAirportId: string,
    date: string,
    passengers: number,
  ): Promise<number | null> {
    const flights = await this.flightsRepository.find({
      where: {
        departureAirportId,
        arrivalAirportId,
        deletedAt: null as never,
      },
    });

    let routeMin: number | null = null;
    for (const flight of flights) {
      if (flight.deletedAt) continue;
      const flightMin = await this.computeFlightMinPrice(flight.id, date, passengers);
      if (flightMin !== null && (routeMin === null || flightMin < routeMin)) {
        routeMin = flightMin;
      }
    }
    return routeMin;
  }

  private async computeFlightMinPrice(
    flightId: string,
    date: string,
    passengers: number,
  ): Promise<number | null> {
    const offers = await this.buildClassOffers(flightId, date, passengers);
    if (!offers.length) {
      return null;
    }
    return Math.min(...offers.map((o) => o.priceCents));
  }

  private async buildClassOffers(
    flightId: string,
    date: string,
    passengers: number,
  ): Promise<FlightDetailDto['classes']> {
    const classes = await this.flightClassesRepository.find({
      where: { flightId },
    });
    const activeClasses = classes.filter((c) => !c.deletedAt);
    if (!activeClasses.length) {
      return [];
    }

    const classIds = activeClasses.map((c) => c.id);
    const availabilityRows = await this.availabilityRepository.find({
      where: {
        flightClassId: In(classIds),
        date,
      },
    });

    const availByClassId = new Map(
      availabilityRows
        .filter((a) => !a.deletedAt)
        .map((a) => [a.flightClassId, a]),
    );

    const offers: FlightDetailDto['classes'] = [];
    for (const flightClass of activeClasses) {
      const avail = availByClassId.get(flightClass.id);
      if (!avail || avail.availableSeats < passengers || avail.availableSeats <= 0) {
        continue;
      }
      offers.push({
        id: flightClass.id,
        className: flightClass.className,
        priceCents: avail.priceCents,
        availableSeats: avail.availableSeats,
        totalPriceCents: avail.priceCents * passengers,
      });
    }

    offers.sort((a, b) => a.priceCents - b.priceCents);
    return offers;
  }

  private toAirportDto(airport: Airports): FlightDetailDto['departureAirport'] {
    return {
      iataCode: airport.iataCode,
      name: airport.name,
      city: airport.city,
      countryCode: airport.countryCode,
    };
  }
}
