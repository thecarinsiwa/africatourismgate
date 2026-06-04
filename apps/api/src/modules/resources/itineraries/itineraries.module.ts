import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Itineraries } from '../../../entities/generated';
import { ItinerariesController } from './itineraries.controller';
import { ItinerariesService } from './itineraries.service';

@Module({
  imports: [TypeOrmModule.forFeature([Itineraries])],
  controllers: [ItinerariesController],
  providers: [ItinerariesService],
})
export class ItinerariesModule {}
