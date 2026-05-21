import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Itineraries, Ships } from '../../../entities/generated';
import { ItinerariesController } from './itineraries.controller';
import { ItinerariesService } from './itineraries.service';

@Module({
  imports: [TypeOrmModule.forFeature([Itineraries, Ships])],
  controllers: [ItinerariesController],
  providers: [ItinerariesService],
})
export class ItinerariesModule {}
