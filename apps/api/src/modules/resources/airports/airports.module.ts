import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Airports } from '../../../entities/generated';
import { AirportsController } from './airports.controller';
import { AirportsService } from './airports.service';

@Module({
  imports: [TypeOrmModule.forFeature([Airports])],
  controllers: [AirportsController],
  providers: [AirportsService],
})
export class AirportsModule {}
