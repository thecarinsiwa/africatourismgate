import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomAvailability } from '../../../entities/generated';
import { RoomAvailabilityController } from './room-availability.controller';
import { RoomAvailabilityService } from './room-availability.service';

@Module({
  imports: [TypeOrmModule.forFeature([RoomAvailability])],
  controllers: [RoomAvailabilityController],
  providers: [RoomAvailabilityService],
})
export class RoomAvailabilityModule {}
