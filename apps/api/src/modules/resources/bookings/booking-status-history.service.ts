import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { newId } from '../../../common/utils/uuid';
import { BookingStatusHistory, Bookings } from '../../../entities/generated';

export type BookingStatusHistoryEntry = {
  id: string;
  bookingId: string;
  fromStatus: Bookings['status'] | null;
  toStatus: Bookings['status'];
  reason: string | null;
  changedByUserId: string | null;
  createdAt: Date;
};

@Injectable()
export class BookingStatusHistoryService {
  constructor(
    @InjectRepository(BookingStatusHistory)
    private readonly historyRepository: Repository<BookingStatusHistory>,
  ) {}

  async record(params: {
    bookingId: string;
    fromStatus: Bookings['status'] | null;
    toStatus: Bookings['status'];
    reason?: string | null;
    changedByUserId?: string | null;
  }): Promise<void> {
    const row = this.historyRepository.create({
      id: newId(),
      bookingId: params.bookingId,
      fromStatus: params.fromStatus,
      toStatus: params.toStatus,
      reason: params.reason?.trim() || null,
      changedByUserId: params.changedByUserId ?? null,
    } as BookingStatusHistory);
    await this.historyRepository.save(row);
  }

  async listByBookingId(bookingId: string): Promise<BookingStatusHistoryEntry[]> {
    const rows = await this.historyRepository.find({
      where: { bookingId },
      order: { createdAt: 'ASC' },
    });
    return rows.map((row) => ({
      id: row.id,
      bookingId: row.bookingId,
      fromStatus: row.fromStatus,
      toStatus: row.toStatus,
      reason: row.reason,
      changedByUserId: row.changedByUserId,
      createdAt: row.createdAt,
    }));
  }
}
