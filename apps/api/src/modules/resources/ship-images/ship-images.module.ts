import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShipImages } from '../../../entities/generated';
import { ShipImagesController } from './ship-images.controller';
import { ShipImagesService } from './ship-images.service';

@Module({
  imports: [TypeOrmModule.forFeature([ShipImages])],
  controllers: [ShipImagesController],
  providers: [ShipImagesService],
})
export class ShipImagesModule {}
