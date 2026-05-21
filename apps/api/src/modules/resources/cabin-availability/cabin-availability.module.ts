import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CabinAvailability,
  Cabins,
  CruiseSailings,
} from '../../../entities/generated';
import { CabinAvailabilityController } from './cabin-availability.controller';
import { CabinAvailabilityService } from './cabin-availability.service';

@Module({
  imports: [TypeOrmModule.forFeature([CabinAvailability, Cabins, CruiseSailings])],
  controllers: [CabinAvailabilityController],
  providers: [CabinAvailabilityService],
})
export class CabinAvailabilityModule {}
