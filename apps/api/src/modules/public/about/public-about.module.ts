import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AboutPages } from '../../../entities/about-page.entity';
import { AboutResources } from '../../../entities/about-resource.entity';
import { TeamMembers } from '../../../entities/team-member.entity';
import { PublicAboutController } from './public-about.controller';
import { PublicAboutService } from './public-about.service';

@Module({
  imports: [TypeOrmModule.forFeature([AboutPages, TeamMembers, AboutResources])],
  controllers: [PublicAboutController],
  providers: [PublicAboutService],
})
export class PublicAboutModule {}
