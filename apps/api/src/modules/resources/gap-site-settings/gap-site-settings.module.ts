import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GapSiteSettings } from '../../../entities/gap-site-settings.entity';
import { GapSiteSettingsController } from './gap-site-settings.controller';
import { GapSiteSettingsService } from './gap-site-settings.service';

@Module({
  imports: [TypeOrmModule.forFeature([GapSiteSettings])],
  controllers: [GapSiteSettingsController],
  providers: [GapSiteSettingsService],
  exports: [GapSiteSettingsService],
})
export class GapSiteSettingsModule {}
