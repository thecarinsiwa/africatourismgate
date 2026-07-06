import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AboutTimelineMilestones } from '../../../entities/about-timeline-milestone.entity';
import { AboutTimelineMilestonesController } from './about-timeline-milestones.controller';
import { AboutTimelineMilestonesService } from './about-timeline-milestones.service';

@Module({
  imports: [TypeOrmModule.forFeature([AboutTimelineMilestones])],
  controllers: [AboutTimelineMilestonesController],
  providers: [AboutTimelineMilestonesService],
  exports: [AboutTimelineMilestonesService],
})
export class AboutTimelineMilestonesModule {}
