import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TreasuryAuditLogs } from '../../../entities/treasury-audit-log.entity';
import { TreasuryAuditService } from './treasury-audit.service';

@Module({
  imports: [TypeOrmModule.forFeature([TreasuryAuditLogs])],
  providers: [TreasuryAuditService],
  exports: [TreasuryAuditService],
})
export class TreasuryAuditModule {}
