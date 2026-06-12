import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Packages } from '../../../entities/generated';
import { PackagesModule } from '../../resources/packages/packages.module';
import { PublicPackagesController } from './public-packages.controller';
import { PublicPackagesService } from './public-packages.service';

@Module({
  imports: [TypeOrmModule.forFeature([Packages]), PackagesModule],
  controllers: [PublicPackagesController],
  providers: [PublicPackagesService],
})
export class PublicPackagesModule {}
