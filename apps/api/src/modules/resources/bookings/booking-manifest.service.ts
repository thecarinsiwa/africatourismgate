import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { newId } from '../../../common/utils/uuid';
import { BookingManifestEntries } from '../../../entities/booking-manifest-entry.entity';
import {
  BookingManifestEntryDto,
  CreateBookingManifestEntryDto,
  UpdateBookingManifestEntryDto,
} from './dto/booking-manifest-entry.dto';
import type { ApproveTravelerPricingDto } from './dto/update-booking-pricing.dto';

function toDto(row: BookingManifestEntries): BookingManifestEntryDto {
  return {
    id: row.id,
    bookingId: row.bookingId,
    sortOrder: row.sortOrder,
    priceCents: row.priceCents,
    fullName: row.fullName,
    age: row.age,
    sex: row.sex,
    nationality: row.nationality,
    idNumber: row.idNumber,
    conditions: row.conditions,
    comment: row.comment,
    other: row.other,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt?.toISOString() ?? null,
  };
}

function normalizeOptionalText(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export type TravelerPricingInput = {
  id?: string;
  fullName?: string;
  age?: number;
  sex?: ApproveTravelerPricingDto['sex'];
  priceCents: number;
};

@Injectable()
export class BookingManifestService {
  constructor(
    @InjectRepository(BookingManifestEntries)
    private readonly repository: Repository<BookingManifestEntries>,
  ) {}

  async listForBooking(bookingId: string): Promise<BookingManifestEntryDto[]> {
    const rows = await this.repository.find({
      where: { bookingId, deletedAt: IsNull() },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
    return rows.map(toDto);
  }

  sumTravelerPrices(entries: Array<{ priceCents?: number | null }>): number {
    return entries.reduce((sum, entry) => sum + (entry.priceCents ?? 0), 0);
  }

  async upsertTravelerPricing(
    bookingId: string,
    travelers: TravelerPricingInput[],
    actorUserId: string,
  ): Promise<BookingManifestEntryDto[]> {
    if (travelers.length === 0) {
      throw new BadRequestException('Au moins un voyageur avec un prix est requis.');
    }

    const results: BookingManifestEntryDto[] = [];
    for (let index = 0; index < travelers.length; index++) {
      const traveler = travelers[index]!;
      if (traveler.priceCents < 0) {
        throw new BadRequestException('Le prix du voyageur doit être positif ou nul.');
      }

      if (traveler.id) {
        const existing = await this.findActiveRow(bookingId, traveler.id);
        const fullName = traveler.fullName?.trim() || existing.fullName;
        const updated = await this.update(
          bookingId,
          traveler.id,
          {
            fullName,
            age: traveler.age ?? existing.age ?? undefined,
            sex: traveler.sex ?? existing.sex ?? undefined,
            priceCents: traveler.priceCents,
            sortOrder: index,
          },
          actorUserId,
        );
        results.push(updated);
        continue;
      }

      const fullName = traveler.fullName?.trim();
      if (!fullName) {
        throw new BadRequestException('Le nom du voyageur est obligatoire.');
      }

      const created = await this.create(
        bookingId,
        {
          fullName,
          age: traveler.age,
          sex: traveler.sex,
          priceCents: traveler.priceCents,
          sortOrder: index,
        },
        actorUserId,
      );
      results.push(created);
    }
    return results;
  }

  async create(
    bookingId: string,
    dto: CreateBookingManifestEntryDto,
    actorUserId: string,
  ): Promise<BookingManifestEntryDto> {
    const sortOrder =
      dto.sortOrder ??
      (await this.nextSortOrder(bookingId));

    const row = this.repository.create({
      id: newId(),
      bookingId,
      sortOrder,
      priceCents: dto.priceCents ?? null,
      fullName: dto.fullName.trim(),
      age: dto.age ?? null,
      sex: dto.sex ?? null,
      nationality: normalizeOptionalText(dto.nationality),
      idNumber: normalizeOptionalText(dto.idNumber),
      conditions: normalizeOptionalText(dto.conditions),
      comment: normalizeOptionalText(dto.comment),
      other: normalizeOptionalText(dto.other),
      createdByUserId: actorUserId,
      updatedByUserId: actorUserId,
      deletedByUserId: null,
      deletedAt: null,
    });
    await this.repository.save(row);
    return toDto(row);
  }

  async update(
    bookingId: string,
    entryId: string,
    dto: UpdateBookingManifestEntryDto,
    actorUserId: string,
  ): Promise<BookingManifestEntryDto> {
    const row = await this.findActiveRow(bookingId, entryId);
    row.fullName = dto.fullName.trim();
    row.age = dto.age ?? null;
    row.sex = dto.sex ?? null;
    row.nationality = normalizeOptionalText(dto.nationality);
    row.idNumber = normalizeOptionalText(dto.idNumber);
    row.conditions = normalizeOptionalText(dto.conditions);
    row.comment = normalizeOptionalText(dto.comment);
    row.other = normalizeOptionalText(dto.other);
    if (dto.priceCents !== undefined) {
      row.priceCents = dto.priceCents;
    }
    if (dto.sortOrder != null) {
      row.sortOrder = dto.sortOrder;
    }
    row.updatedByUserId = actorUserId;
    await this.repository.save(row);
    return toDto(row);
  }

  async remove(
    bookingId: string,
    entryId: string,
    actorUserId: string,
  ): Promise<void> {
    const row = await this.findActiveRow(bookingId, entryId);
    row.deletedAt = new Date();
    row.deletedByUserId = actorUserId;
    await this.repository.save(row);
  }

  private async nextSortOrder(bookingId: string): Promise<number> {
    const latest = await this.repository.findOne({
      where: { bookingId, deletedAt: IsNull() },
      order: { sortOrder: 'DESC' },
    });
    return (latest?.sortOrder ?? -1) + 1;
  }

  private async findActiveRow(
    bookingId: string,
    entryId: string,
  ): Promise<BookingManifestEntries> {
    const row = await this.repository.findOne({
      where: { id: entryId, bookingId, deletedAt: IsNull() },
    });
    if (!row) {
      throw new NotFoundException('Entrée du manifeste introuvable.');
    }
    return row;
  }
}
