import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  FundEntries,
  FundEntryBookings,
} from '../../../entities/fund-entry.entity';
import {
  FundExitBookings,
  FundExits,
} from '../../../entities/fund-exit.entity';
import { TreasuryReportsController } from './treasury-reports.controller';
import { TreasuryReportsService } from './treasury-reports.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FundEntries,
      FundExits,
      FundEntryBookings,
      FundExitBookings,
    ]),
  ],
  controllers: [TreasuryReportsController],
  providers: [TreasuryReportsService],
  exports: [TreasuryReportsService],
})
export class TreasuryReportsModule {}
