import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AccountingExercises,
  AccountingPeriods,
} from '../../../entities/accounting-exercise.entity';
import { AccountingJournals } from '../../../entities/accounting-journal.entity';
import { ChartOfAccounts } from '../../../entities/chart-of-account.entity';
import { JournalEntries } from '../../../entities/journal-entry.entity';
import { Organizations } from '../../../entities/generated/organizations.entity';
import { AccountingAuditModule } from '../accounting-audit/accounting-audit.module';
import { JournalEntriesModule } from '../journal-entries/journal-entries.module';
import { AccountingExercisesController } from './accounting-exercises.controller';
import { AccountingExercisesService } from './accounting-exercises.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AccountingExercises,
      AccountingPeriods,
      AccountingJournals,
      ChartOfAccounts,
      Organizations,
      JournalEntries,
    ]),
    JournalEntriesModule,
    AccountingAuditModule,
  ],
  controllers: [AccountingExercisesController],
  providers: [AccountingExercisesService],
  exports: [AccountingExercisesService],
})
export class AccountingExercisesModule {}
