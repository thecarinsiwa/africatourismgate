import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlightImages } from '../../../entities/generated';
import { FlightImagesController } from './flight-images.controller';
import { FlightImagesService } from './flight-images.service';

@Module({
  imports: [TypeOrmModule.forFeature([FlightImages])],
  controllers: [FlightImagesController],
  providers: [FlightImagesService],
})
export class FlightImagesModule {}
