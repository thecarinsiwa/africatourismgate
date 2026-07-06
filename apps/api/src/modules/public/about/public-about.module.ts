import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AboutPages } from '../../../entities/about-page.entity';
import { AboutTimelineMilestones } from '../../../entities/about-timeline-milestone.entity';
import { AboutResources } from '../../../entities/about-resource.entity';
import { TeamMembers } from '../../../entities/team-member.entity';
import { WhyUsItems } from '../../../entities/why-us-item.entity';
import { WhyUsSections } from '../../../entities/why-us-section.entity';
import { HappyCustomersSections } from '../../../entities/happy-customers-section.entity';
import { HappyCustomersStats } from '../../../entities/happy-customers-stat.entity';
import { PublicAboutController } from './public-about.controller';
import { PublicAboutService } from './public-about.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AboutPages,
      TeamMembers,
      AboutResources,
      AboutTimelineMilestones,
      WhyUsSections,
      WhyUsItems,
      HappyCustomersSections,
      HappyCustomersStats,
    ]),
  ],
  controllers: [PublicAboutController],
  providers: [PublicAboutService],
})
export class PublicAboutModule {}
