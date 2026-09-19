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

      // Pricing-only stub: nationality/idNumber must be completed via manifest CRUD.
      // Persist via repository so staff can add a priced traveler before docs are ready.
      const stub = this.repository.create({
        id: newId(),
        bookingId,
        sortOrder: index,
        priceCents: traveler.priceCents,
        fullName,
        age: traveler.age ?? null,
        sex: traveler.sex ?? null,
        nationality: null,
        idNumber: null,
        conditions: null,
        comment: null,
        other: null,
        createdByUserId: actorUserId,
        updatedByUserId: actorUserId,
        deletedByUserId: null,
        deletedAt: null,
      });
      await this.repository.save(stub);
      results.push(toDto(stub));
    }

    const keptIds = new Set(results.map((entry) => entry.id));
    const existing = await this.repository.find({
      where: { bookingId, deletedAt: IsNull() },
    });
    for (const row of existing) {
      if (!keptIds.has(row.id)) {
        await this.remove(bookingId, row.id, actorUserId);
      }
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

    const nationality = dto.nationality.trim();
    const idNumber = dto.idNumber.trim();
    if (!nationality) {
      throw new BadRequestException('La nationalité est obligatoire.');
    }
    if (!idNumber) {
      throw new BadRequestException("Le numéro de pièce d'identité est obligatoire.");
    }

    const row = this.repository.create({
      id: newId(),
      bookingId,
      sortOrder,
      priceCents: dto.priceCents ?? null,
      fullName: dto.fullName.trim(),
      age: dto.age ?? null,
      sex: dto.sex ?? null,
      nationality,
      idNumber,
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
    if (dto.fullName !== undefined) {
      const fullName = dto.fullName.trim();
      if (!fullName) {
        throw new BadRequestException('Le nom complet est obligatoire.');
      }
      row.fullName = fullName;
    }
    if (dto.age !== undefined) {
      row.age = dto.age ?? null;
    }
    if (dto.sex !== undefined) {
      row.sex = dto.sex ?? null;
    }
    if (dto.nationality !== undefined) {
      const nationality = dto.nationality.trim();
      if (!nationality) {
        throw new BadRequestException('La nationalité est obligatoire.');
      }
      row.nationality = nationality;
    }
    if (dto.idNumber !== undefined) {
      const idNumber = dto.idNumber.trim();
      if (!idNumber) {
        throw new BadRequestException("Le numéro de pièce d'identité est obligatoire.");
      }
      row.idNumber = idNumber;
    }
    if (dto.conditions !== undefined) {
      row.conditions = normalizeOptionalText(dto.conditions);
    }
    if (dto.comment !== undefined) {
      row.comment = normalizeOptionalText(dto.comment);
    }
    if (dto.other !== undefined) {
      row.other = normalizeOptionalText(dto.other);
    }
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
