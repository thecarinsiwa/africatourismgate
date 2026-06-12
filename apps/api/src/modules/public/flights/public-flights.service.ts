import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import {
  Airlines,
  Airports,
  FlightClassAvailability,
  FlightClasses,
  Flights,
} from '../../../entities/generated';
import { FlightDetailQueryDto } from './dto/flight-detail-query.dto';
import { FlightDetailDto } from './dto/flight-detail.dto';
import { FlightSearchQueryDto } from './dto/flight-search-query.dto';
import { FlightSearchResultDto } from './dto/flight-search-result.dto';
import { PublicAirportDto } from './dto/public-airport.dto';
import { assertValidFlightDates } from './flight-dates.util';

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

    const fromAirport = await this.findAirportByIata(query.from);
    const toAirport = await this.findAirportByIata(query.to);
    if (!fromAirport || !toAirport) {
      return {
        data: [],
        meta: { total: 0, page, limit, totalPages: 1 },
      };
    }

    const outboundFlights = await this.flightsRepository.find({
      where: {
        departureAirportId: fromAirport.id,
        arrivalAirportId: toAirport.id,
        deletedAt: null as never,
      },
      order: { departureTime: 'ASC' },
    });

    const returnMinPrice = query.returnDate
      ? await this.computeRouteMinPrice(
          toAirport.id,
          fromAirport.id,
          query.returnDate,
          passengers,
        )
      : null;

    if (query.returnDate && returnMinPrice === null) {
      return {
        data: [],
        meta: { total: 0, page, limit, totalPages: 1 },
      };
    }

    const airlineIds = [...new Set(outboundFlights.map((f) => f.airlineId))];
    const airlines =
      airlineIds.length > 0
        ? await this.airlinesRepository.find({ where: { id: In(airlineIds) } })
        : [];
    const airlineById = new Map(
      airlines.filter((a) => !a.deletedAt).map((a) => [a.id, a]),
    );

    const results: FlightSearchResultDto[] = [];

    for (const flight of outboundFlights) {
      if (flight.deletedAt) continue;

      const outboundMin = await this.computeFlightMinPrice(
        flight.id,
        query.departureDate,
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
        departureAirportIata: fromAirport.iataCode,
        departureAirportCity: fromAirport.city,
        arrivalAirportIata: toAirport.iataCode,
        arrivalAirportCity: toAirport.city,
        departureTime: flight.departureTime.toISOString(),
        arrivalTime: flight.arrivalTime.toISOString(),
        durationMinutes: flight.durationMinutes,
        minPriceCents,
        currency: DEFAULT_CURRENCY,
        roundTrip: Boolean(query.returnDate),
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
    };
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
