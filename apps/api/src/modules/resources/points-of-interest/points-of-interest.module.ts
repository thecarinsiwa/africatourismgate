import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointsOfInterest } from '../../../entities/generated';
import { PointsOfInterestController } from './points-of-interest.controller';
import { PointsOfInterestService } from './points-of-interest.service';

@Module({
  imports: [TypeOrmModule.forFeature([PointsOfInterest])],
  controllers: [PointsOfInterestController],
  providers: [PointsOfInterestService],
})
export class PointsOfInterestModule {}
