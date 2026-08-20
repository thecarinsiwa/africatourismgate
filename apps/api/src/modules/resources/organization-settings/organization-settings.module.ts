import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  OrganizationSettings,
  Organizations,
} from '../../../entities/generated';
import { OrganizationSettingsController } from './organization-settings.controller';
import { OrganizationSettingsService } from './organization-settings.service';

@Module({
  imports: [TypeOrmModule.forFeature([OrganizationSettings, Organizations])],
  controllers: [OrganizationSettingsController],
  providers: [OrganizationSettingsService],
  exports: [OrganizationSettingsService],
})
export class OrganizationSettingsModule {}
