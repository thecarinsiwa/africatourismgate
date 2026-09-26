import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  FundEntries,
  FundEntryBookings,
} from '../../../entities/fund-entry.entity';
import { FundEntriesController } from './fund-entries.controller';
import { FundEntriesService } from './fund-entries.service';

@Module({
  imports: [TypeOrmModule.forFeature([FundEntries, FundEntryBookings])],
  controllers: [FundEntriesController],
  providers: [FundEntriesService],
  exports: [FundEntriesService],
})
export class FundEntriesModule {}
