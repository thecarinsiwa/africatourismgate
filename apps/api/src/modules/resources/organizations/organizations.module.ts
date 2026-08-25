import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Employees,
  Organizations,
  OrganizationSettings,
  TourGuides,
  Users,
} from '../../../entities/generated';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Organizations,
      OrganizationSettings,
      Users,
      Employees,
      TourGuides,
    ]),
  ],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
})
export class OrganizationsModule {}
