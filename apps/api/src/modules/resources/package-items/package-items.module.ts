import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PackageItems, Packages } from '../../../entities/generated';
import { PackagesModule } from '../packages/packages.module';
import { PackageItemsController } from './package-items.controller';
import { PackageItemsService } from './package-items.service';

@Module({
  imports: [TypeOrmModule.forFeature([PackageItems, Packages]), PackagesModule],
  controllers: [PackageItemsController],
  providers: [PackageItemsService],
})
export class PackageItemsModule {}
