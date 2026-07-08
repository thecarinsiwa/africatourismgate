import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PackageDescriptionAssets } from '../../../entities/generated';
import { PackageDescriptionAssetsController } from './package-description-assets.controller';
import { PackageDescriptionAssetsService } from './package-description-assets.service';

@Module({
  imports: [TypeOrmModule.forFeature([PackageDescriptionAssets])],
  controllers: [PackageDescriptionAssetsController],
  providers: [PackageDescriptionAssetsService],
  exports: [PackageDescriptionAssetsService],
})
export class PackageDescriptionAssetsModule {}
