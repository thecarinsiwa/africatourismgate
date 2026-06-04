import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivitySchedules } from '../../../entities/generated';
import { ActivitySchedulesController } from './activity-schedules.controller';
import { ActivitySchedulesService } from './activity-schedules.service';

@Module({
  imports: [TypeOrmModule.forFeature([ActivitySchedules])],
  controllers: [ActivitySchedulesController],
  providers: [ActivitySchedulesService],
})
export class ActivitySchedulesModule {}
