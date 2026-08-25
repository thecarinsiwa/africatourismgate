import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingMessages } from '../../../entities/generated';
import { BookingMessagesController } from './booking-messages.controller';
import { BookingMessagesService } from './booking-messages.service';

@Module({
  imports: [TypeOrmModule.forFeature([BookingMessages])],
  controllers: [BookingMessagesController],
  providers: [BookingMessagesService],
})
export class BookingMessagesModule {}
