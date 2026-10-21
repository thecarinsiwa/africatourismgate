import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountingAuditLogs } from '../../../entities/accounting-audit-log.entity';
import { AccountingAuditLogsController } from './accounting-audit.controller';
import { AccountingAuditService } from './accounting-audit.service';

@Module({
  imports: [TypeOrmModule.forFeature([AccountingAuditLogs])],
  controllers: [AccountingAuditLogsController],
  providers: [AccountingAuditService],
  exports: [AccountingAuditService],
})
export class AccountingAuditModule {}
