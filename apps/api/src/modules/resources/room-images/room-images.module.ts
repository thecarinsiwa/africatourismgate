import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomImages } from '../../../entities/generated';
import { RoomImagesController } from './room-images.controller';
import { RoomImagesService } from './room-images.service';

@Module({
  imports: [TypeOrmModule.forFeature([RoomImages])],
  controllers: [RoomImagesController],
  providers: [RoomImagesService],
})
export class RoomImagesModule {}
