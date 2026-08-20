import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingGuideAssignments } from '../../../entities/generated';
import { BookingGuideAssignmentsController } from './booking-guide-assignments.controller';
import { BookingGuideAssignmentsService } from './booking-guide-assignments.service';

@Module({
  imports: [TypeOrmModule.forFeature([BookingGuideAssignments])],
  controllers: [BookingGuideAssignmentsController],
  providers: [BookingGuideAssignmentsService],
})
export class BookingGuideAssignmentsModule {}
