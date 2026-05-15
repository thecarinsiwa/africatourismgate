import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleCategories } from '../../../entities/generated';
import { VehicleCategoriesController } from './vehicle-categories.controller';
import { VehicleCategoriesService } from './vehicle-categories.service';

@Module({
  imports: [TypeOrmModule.forFeature([VehicleCategories])],
  controllers: [VehicleCategoriesController],
  providers: [VehicleCategoriesService],
})
export class VehicleCategoriesModule {}
