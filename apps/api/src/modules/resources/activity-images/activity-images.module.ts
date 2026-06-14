import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityImages } from '../../../entities/generated';
import { ActivityImagesController } from './activity-images.controller';
import { ActivityImagesService } from './activity-images.service';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityImages])],
  controllers: [ActivityImagesController],
  providers: [ActivityImagesService],
})
export class ActivityImagesModule {}
