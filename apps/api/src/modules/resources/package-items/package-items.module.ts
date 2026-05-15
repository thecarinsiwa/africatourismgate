import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PackageItems } from '../../../entities/generated';
import { PackageItemsController } from './package-items.controller';
import { PackageItemsService } from './package-items.service';

@Module({
  imports: [TypeOrmModule.forFeature([PackageItems])],
  controllers: [PackageItemsController],
  providers: [PackageItemsService],
})
export class PackageItemsModule {}
