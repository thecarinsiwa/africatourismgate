import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GapActivities } from '../../../entities/gap-activity.entity';
import { GapActivitiesController } from './gap-activities.controller';
import { GapActivitiesService } from './gap-activities.service';

@Module({
  imports: [TypeOrmModule.forFeature([GapActivities])],
  controllers: [GapActivitiesController],
  providers: [GapActivitiesService],
  exports: [GapActivitiesService],
})
export class GapActivitiesModule {}
