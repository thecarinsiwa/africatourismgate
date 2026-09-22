import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  OrganizationSettings,
  Organizations,
} from '../../../entities/generated';
import { OrganizationMaintenancesModule } from '../organization-maintenances/organization-maintenances.module';
import { OrganizationSettingsController } from './organization-settings.controller';
import { OrganizationSettingsService } from './organization-settings.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrganizationSettings, Organizations]),
    OrganizationMaintenancesModule,
  ],
  controllers: [OrganizationSettingsController],
  providers: [OrganizationSettingsService],
  exports: [OrganizationSettingsService],
})
export class OrganizationSettingsModule {}
