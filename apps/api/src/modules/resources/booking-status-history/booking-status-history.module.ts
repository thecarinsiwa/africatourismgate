import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingStatusHistory } from '../../../entities/generated';
import { BookingStatusHistoryController } from './booking-status-history.controller';
import { BookingStatusHistoryService } from './booking-status-history.service';

@Module({
  imports: [TypeOrmModule.forFeature([BookingStatusHistory])],
  controllers: [BookingStatusHistoryController],
  providers: [BookingStatusHistoryService],
})
export class BookingStatusHistoryModule {}
