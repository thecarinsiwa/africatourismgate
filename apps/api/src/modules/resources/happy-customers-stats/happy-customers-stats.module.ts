import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HappyCustomersStats } from '../../../entities/happy-customers-stat.entity';
import { HappyCustomersStatsController } from './happy-customers-stats.controller';
import { HappyCustomersStatsService } from './happy-customers-stats.service';

@Module({
  imports: [TypeOrmModule.forFeature([HappyCustomersStats])],
  controllers: [HappyCustomersStatsController],
  providers: [HappyCustomersStatsService],
  exports: [HappyCustomersStatsService],
})
export class HappyCustomersStatsModule {}
