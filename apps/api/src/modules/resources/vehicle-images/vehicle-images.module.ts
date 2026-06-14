import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleImages } from '../../../entities/generated';
import { VehicleImagesController } from './vehicle-images.controller';
import { VehicleImagesService } from './vehicle-images.service';

@Module({
  imports: [TypeOrmModule.forFeature([VehicleImages])],
  controllers: [VehicleImagesController],
  providers: [VehicleImagesService],
})
export class VehicleImagesModule {}
