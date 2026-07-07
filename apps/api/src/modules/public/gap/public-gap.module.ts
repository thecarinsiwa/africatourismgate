import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GapActivities } from '../../../entities/gap-activity.entity';
import { GapImpactStats } from '../../../entities/gap-impact-stat.entity';
import { GapMediaItems } from '../../../entities/gap-media-item.entity';
import { GapPages } from '../../../entities/gap-page.entity';
import { GapSiteSettings } from '../../../entities/gap-site-settings.entity';
import { PublicGapController } from './public-gap.controller';
import { PublicGapService } from './public-gap.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GapSiteSettings,
      GapPages,
      GapActivities,
      GapImpactStats,
      GapMediaItems,
    ]),
  ],
  controllers: [PublicGapController],
  providers: [PublicGapService],
})
export class PublicGapModule {}
