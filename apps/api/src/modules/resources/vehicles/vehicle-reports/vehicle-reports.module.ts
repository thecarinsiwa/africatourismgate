import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  BookingItems,
  Organizations,
  RentalAgencies,
  VehicleAvailability,
  VehicleCategories,
  VehicleRoutes,
  Vehicles,
} from '../../../../entities/generated';
import { EmailModule } from '../../../email/email.module';
import { VehicleReportsController } from './vehicle-reports.controller';
import { VehicleReportsService } from './vehicle-reports.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vehicles,
      RentalAgencies,
      VehicleCategories,
      VehicleRoutes,
      VehicleAvailability,
      BookingItems,
      Organizations,
    ]),
    EmailModule,
  ],
  controllers: [VehicleReportsController],
  providers: [VehicleReportsService],
  exports: [VehicleReportsService],
})
export class VehicleReportsModule {}
