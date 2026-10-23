import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingItems } from '../../../entities/generated';
import { BookingsModule } from '../bookings/bookings.module';
import { BookingItemsController } from './booking-items.controller';
import { BookingItemsService } from './booking-items.service';

@Module({
  imports: [TypeOrmModule.forFeature([BookingItems]), BookingsModule],
  controllers: [BookingItemsController],
  providers: [BookingItemsService],
})
export class BookingItemsModule {}
