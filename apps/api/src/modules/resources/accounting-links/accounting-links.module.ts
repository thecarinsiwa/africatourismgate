import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountingLinks } from '../../../entities/accounting-link.entity';
import { FundEntries } from '../../../entities/fund-entry.entity';
import { FundExits } from '../../../entities/fund-exit.entity';
import { TreasuryAuditModule } from '../treasury-audit/treasury-audit.module';
import { AccountingLinksController } from './accounting-links.controller';
import { AccountingLinksService } from './accounting-links.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AccountingLinks, FundEntries, FundExits]),
    TreasuryAuditModule,
  ],
  controllers: [AccountingLinksController],
  providers: [AccountingLinksService],
  exports: [AccountingLinksService],
})
export class AccountingLinksModule {}
