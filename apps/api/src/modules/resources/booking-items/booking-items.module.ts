import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingItems } from '../../../entities/generated';
import { BookingItemsController } from './booking-items.controller';
import { BookingItemsService } from './booking-items.service';

@Module({
  imports: [TypeOrmModule.forFeature([BookingItems])],
  controllers: [BookingItemsController],
  providers: [BookingItemsService],
})
export class BookingItemsModule {}
