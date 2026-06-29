import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Properties, PropertyAmenities } from '../../../entities/generated';
import { PropertyAmenitiesController } from './property-amenities.controller';
import { PropertyAmenitiesService } from './property-amenities.service';

@Module({
  imports: [TypeOrmModule.forFeature([PropertyAmenities, Properties])],
  controllers: [PropertyAmenitiesController],
  providers: [PropertyAmenitiesService],
})
export class PropertyAmenitiesModule {}
