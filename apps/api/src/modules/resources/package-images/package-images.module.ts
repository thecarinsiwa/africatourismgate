import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PackageImages } from '../../../entities/generated';
import { PackageImagesController } from './package-images.controller';
import { PackageImagesService } from './package-images.service';

@Module({
  imports: [TypeOrmModule.forFeature([PackageImages])],
  controllers: [PackageImagesController],
  providers: [PackageImagesService],
})
export class PackageImagesModule {}
