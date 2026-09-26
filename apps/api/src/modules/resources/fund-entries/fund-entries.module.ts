import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  FundEntries,
  FundEntryAttachments,
  FundEntryBookings,
} from '../../../entities/fund-entry.entity';
import { Bookings } from '../../../entities/generated';
import { TreasuryAuditModule } from '../treasury-audit/treasury-audit.module';
import { FundEntriesController } from './fund-entries.controller';
import { FundEntriesService } from './fund-entries.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FundEntries,
      FundEntryBookings,
      FundEntryAttachments,
      Bookings,
    ]),
    TreasuryAuditModule,
  ],
  controllers: [FundEntriesController],
  providers: [FundEntriesService],
  exports: [FundEntriesService],
})
export class FundEntriesModule {}
