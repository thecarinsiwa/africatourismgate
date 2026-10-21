import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountingJournals } from '../../../entities/accounting-journal.entity';
import { AccountingJournalsController } from './accounting-journals.controller';
import { AccountingJournalsService } from './accounting-journals.service';

@Module({
  imports: [TypeOrmModule.forFeature([AccountingJournals])],
  controllers: [AccountingJournalsController],
  providers: [AccountingJournalsService],
  exports: [AccountingJournalsService],
})
export class AccountingJournalsModule {}
