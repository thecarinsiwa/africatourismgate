import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityDescriptionAssets } from '../../../entities/generated';
import { ActivityDescriptionAssetsController } from './activity-description-assets.controller';
import { ActivityDescriptionAssetsService } from './activity-description-assets.service';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityDescriptionAssets])],
  controllers: [ActivityDescriptionAssetsController],
  providers: [ActivityDescriptionAssetsService],
  exports: [ActivityDescriptionAssetsService],
})
export class ActivityDescriptionAssetsModule {}
