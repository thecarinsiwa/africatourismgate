import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bookings } from '../../../entities/generated';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';

@Module({
  imports: [TypeOrmModule.forFeature([Bookings])],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
