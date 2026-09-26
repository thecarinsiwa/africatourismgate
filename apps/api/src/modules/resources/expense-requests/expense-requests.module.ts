import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ExpenseRequests,
  ExpenseRequestStatusHistory,
} from '../../../entities/fund-exit.entity';
import { RbacModule } from '../../rbac/rbac.module';
import { ExternalCollaboratorsModule } from '../external-collaborators/external-collaborators.module';
import { TreasuryAuditModule } from '../treasury-audit/treasury-audit.module';
import { ExpenseRequestsController } from './expense-requests.controller';
import { ExpenseRequestsService } from './expense-requests.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExpenseRequests, ExpenseRequestStatusHistory]),
    RbacModule,
    ExternalCollaboratorsModule,
    TreasuryAuditModule,
  ],
  controllers: [ExpenseRequestsController],
  providers: [ExpenseRequestsService],
  exports: [ExpenseRequestsService],
})
export class ExpenseRequestsModule {}
