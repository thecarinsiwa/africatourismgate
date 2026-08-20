import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TourGuides } from '../../../entities/generated';
import { TourGuidesController } from './tour-guides.controller';
import { TourGuidesService } from './tour-guides.service';

@Module({
  imports: [TypeOrmModule.forFeature([TourGuides])],
  controllers: [TourGuidesController],
  providers: [TourGuidesService],
})
export class TourGuidesModule {}
