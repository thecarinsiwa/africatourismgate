import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomAvailability, Rooms } from '../../../entities/generated';
import { RoomAvailabilityController } from './room-availability.controller';
import { RoomAvailabilityService } from './room-availability.service';

@Module({
  imports: [TypeOrmModule.forFeature([RoomAvailability, Rooms])],
  controllers: [RoomAvailabilityController],
  providers: [RoomAvailabilityService],
})
export class RoomAvailabilityModule {}
