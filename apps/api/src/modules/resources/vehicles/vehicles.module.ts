import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehicles } from '../../../entities/generated';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';
import { VehicleReportsModule } from './vehicle-reports/vehicle-reports.module';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicles]), VehicleReportsModule],
  controllers: [VehiclesController],
  providers: [VehiclesService],
})
export class VehiclesModule {}
