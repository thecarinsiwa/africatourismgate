import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RbacAuditLogs, Users } from '../../../entities/generated';
import { RbacModule } from '../../rbac/rbac.module';
import { RbacAuditLogsController } from './rbac-audit-logs.controller';
import { RbacAuditLogsService } from './rbac-audit-logs.service';

@Module({
  imports: [TypeOrmModule.forFeature([RbacAuditLogs, Users]), RbacModule],
  controllers: [RbacAuditLogsController],
  providers: [RbacAuditLogsService],
})
export class RbacAuditLogsModule {}
