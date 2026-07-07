import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GapImpactStats } from '../../../entities/gap-impact-stat.entity';
import { GapImpactStatsController } from './gap-impact-stats.controller';
import { GapImpactStatsService } from './gap-impact-stats.service';

@Module({
  imports: [TypeOrmModule.forFeature([GapImpactStats])],
  controllers: [GapImpactStatsController],
  providers: [GapImpactStatsService],
  exports: [GapImpactStatsService],
})
export class GapImpactStatsModule {}
