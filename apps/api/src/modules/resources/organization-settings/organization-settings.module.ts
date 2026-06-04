import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationSettings } from '../../../entities/generated';
import { OrganizationSettingsController } from './organization-settings.controller';
import { OrganizationSettingsService } from './organization-settings.service';

@Module({
  imports: [TypeOrmModule.forFeature([OrganizationSettings])],
  controllers: [OrganizationSettingsController],
  providers: [OrganizationSettingsService],
})
export class OrganizationSettingsModule {}
