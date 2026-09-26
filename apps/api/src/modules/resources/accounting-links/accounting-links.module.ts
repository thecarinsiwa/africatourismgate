import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountingLinks } from '../../../entities/accounting-link.entity';
import { AccountingMappingRules } from '../../../entities/accounting-mapping-rule.entity';
import { ChartOfAccounts } from '../../../entities/chart-of-account.entity';
import { FundEntries } from '../../../entities/fund-entry.entity';
import { FundExits } from '../../../entities/fund-exit.entity';
import { JournalEntriesModule } from '../journal-entries/journal-entries.module';
import { TreasuryAuditModule } from '../treasury-audit/treasury-audit.module';
import { AccountingLinksController } from './accounting-links.controller';
import { AccountingLinksService } from './accounting-links.service';
import { AccountingMappingEngine } from './accounting-mapping.engine';
import { AccountingPostingService } from './accounting-posting.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AccountingLinks,
      AccountingMappingRules,
      ChartOfAccounts,
      FundEntries,
      FundExits,
    ]),
    TreasuryAuditModule,
    JournalEntriesModule,
  ],
  controllers: [AccountingLinksController],
  providers: [
    AccountingLinksService,
    AccountingMappingEngine,
    AccountingPostingService,
  ],
  exports: [
    AccountingLinksService,
    AccountingMappingEngine,
    AccountingPostingService,
  ],
})
export class AccountingLinksModule {}
