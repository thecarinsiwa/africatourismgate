import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountingJournals } from '../../../entities/accounting-journal.entity';
import {
  AccountingExercises,
  AccountingPeriods,
} from '../../../entities/accounting-exercise.entity';
import { ChartOfAccounts } from '../../../entities/chart-of-account.entity';
import {
  JournalEntries,
  JournalLines,
} from '../../../entities/journal-entry.entity';
import { JournalEntriesController } from './journal-entries.controller';
import { JournalEntriesService } from './journal-entries.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      JournalEntries,
      JournalLines,
      AccountingJournals,
      AccountingExercises,
      AccountingPeriods,
      ChartOfAccounts,
    ]),
  ],
  controllers: [JournalEntriesController],
  providers: [JournalEntriesService],
  exports: [JournalEntriesService],
})
export class JournalEntriesModule {}
