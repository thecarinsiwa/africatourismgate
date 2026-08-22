import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { newId } from '../../../common/utils/uuid';
import {
  BookingGuideAssignments,
  Bookings,
} from '../../../entities/generated';
import {
  AssignBookingGuidesDto,
  BookingGuideAssignmentDto,
  toBookingGuideAssignmentDto,
} from './dto/booking-guide-assignment.dto';
import { TourGuidesService } from './tour-guides.service';
import { BookingGuideAssignmentEmailService } from './booking-guide-assignment-email.service';

@Injectable()
export class BookingGuideAssignmentsService {
  constructor(
    @InjectRepository(BookingGuideAssignments)
    private readonly assignmentsRepository: Repository<BookingGuideAssignments>,
    @InjectRepository(Bookings)
    private readonly bookingsRepository: Repository<Bookings>,
    private readonly tourGuidesService: TourGuidesService,
    private readonly guideAssignmentEmail: BookingGuideAssignmentEmailService,
  ) {}

  async listByBookingId(bookingId: string): Promise<BookingGuideAssignmentDto[]> {
    await this.requireBooking(bookingId);
    const rows = await this.assignmentsRepository.find({
      where: { bookingId },
      order: { assignedAt: 'ASC' },
    });
    return rows.map(toBookingGuideAssignmentDto);
  }

  async assignGuides(
    bookingId: string,
    dto: AssignBookingGuidesDto,
    actorUserId: string,
  ): Promise<BookingGuideAssignmentDto[]> {
    await this.requireBooking(bookingId);

    const seenGuideIds = new Set<string>();
    for (const item of dto.guides) {
      if (seenGuideIds.has(item.guideId)) {
        throw new BadRequestException(
          `Le guide ${item.guideId} est en double dans la requête.`,
        );
      }
      seenGuideIds.add(item.guideId);
      await this.tourGuidesService.requireActiveGuide(item.guideId);
    }

    const results: BookingGuideAssignmentDto[] = [];

    for (const item of dto.guides) {
      const role = item.role ?? 'primary';
      const existing = await this.assignmentsRepository.findOne({
        where: { bookingId, guideId: item.guideId },
      });

      if (existing) {
        existing.role = role;
        existing.assignedByUserId = actorUserId;
        const saved = await this.assignmentsRepository.save(existing);
        results.push(toBookingGuideAssignmentDto(saved));
        continue;
      }

      const created = this.assignmentsRepository.create({
        id: newId(),
        bookingId,
        guideId: item.guideId,
        role,
        assignedByUserId: actorUserId,
      });
      const saved = await this.assignmentsRepository.save(created);
      results.push(toBookingGuideAssignmentDto(saved));
      this.guideAssignmentEmail.notifyGuideAssigned(bookingId, item.guideId, role);
    }

    return results;
  }

  async removeGuide(
    bookingId: string,
    guideId: string,
    comment?: string | null,
  ): Promise<void> {
    await this.requireBooking(bookingId);
    const assignment = await this.assignmentsRepository.findOne({
      where: { bookingId, guideId },
    });
    if (!assignment) {
      throw new NotFoundException(
        `Aucune assignation du guide ${guideId} sur la réservation ${bookingId}.`,
      );
    }

    this.guideAssignmentEmail.notifyGuideRemoved(
      bookingId,
      guideId,
      assignment.role,
      comment,
    );
    await this.assignmentsRepository.delete(assignment.id);
  }

  private async requireBooking(bookingId: string): Promise<Bookings> {
    const booking = await this.bookingsRepository.findOne({
      where: { id: bookingId, deletedAt: IsNull() },
    });
    if (!booking) {
      throw new NotFoundException(`Réservation ${bookingId} introuvable.`);
    }
    return booking;
  }
}
