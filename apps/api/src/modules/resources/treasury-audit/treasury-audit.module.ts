import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TreasuryAuditLogs } from '../../../entities/treasury-audit-log.entity';
import { TreasuryAuditLogsController } from './treasury-audit.controller';
import { TreasuryAuditService } from './treasury-audit.service';

@Module({
  imports: [TypeOrmModule.forFeature([TreasuryAuditLogs])],
  controllers: [TreasuryAuditLogsController],
  providers: [TreasuryAuditService],
  exports: [TreasuryAuditService],
})
export class TreasuryAuditModule {}
