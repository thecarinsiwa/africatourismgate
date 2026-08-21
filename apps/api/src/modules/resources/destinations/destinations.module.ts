import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Activities,
  Destinations,
  Packages,
  Properties,
} from '../../../entities/generated';
import { DestinationsController } from './destinations.controller';
import { DestinationsService } from './destinations.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Destinations, Properties, Activities, Packages]),
  ],
  controllers: [DestinationsController],
  providers: [DestinationsService],
})
export class DestinationsModule {}
