import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Destinations } from '../../../entities/generated';
import { DestinationsController } from './destinations.controller';
import { DestinationsService } from './destinations.service';

@Module({
  imports: [TypeOrmModule.forFeature([Destinations])],
  controllers: [DestinationsController],
  providers: [DestinationsService],
})
export class DestinationsModule {}
