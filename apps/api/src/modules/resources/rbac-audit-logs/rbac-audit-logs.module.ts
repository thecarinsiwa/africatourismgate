import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RbacAuditLogs, Users } from '../../../entities/generated';
import { RbacAuditLogsController } from './rbac-audit-logs.controller';
import { RbacAuditLogsService } from './rbac-audit-logs.service';

@Module({
  imports: [TypeOrmModule.forFeature([RbacAuditLogs, Users])],
  controllers: [RbacAuditLogsController],
  providers: [RbacAuditLogsService],
})
export class RbacAuditLogsModule {}
