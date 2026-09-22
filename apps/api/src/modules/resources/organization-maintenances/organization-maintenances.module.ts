import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organizations } from '../../../entities/generated';
import { OrganizationMaintenances } from '../../../entities/organization-maintenance.entity';
import { OrganizationMaintenancesController } from './organization-maintenances.controller';
import { OrganizationMaintenancesService } from './organization-maintenances.service';
import { PublicOrganizationMaintenancesController } from './public-organization-maintenances.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OrganizationMaintenances, Organizations])],
  controllers: [
    OrganizationMaintenancesController,
    PublicOrganizationMaintenancesController,
  ],
  providers: [OrganizationMaintenancesService],
  exports: [OrganizationMaintenancesService],
})
export class OrganizationMaintenancesModule {}
