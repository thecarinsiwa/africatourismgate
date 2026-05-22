import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Destinations, RentalAgencies } from '../../../entities/generated';
import { RentalAgenciesController } from './rental-agencies.controller';
import { RentalAgenciesService } from './rental-agencies.service';

@Module({
  imports: [TypeOrmModule.forFeature([RentalAgencies, Destinations])],
  controllers: [RentalAgenciesController],
  providers: [RentalAgenciesService],
})
export class RentalAgenciesModule {}
