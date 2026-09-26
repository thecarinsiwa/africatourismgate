import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ExpenseRequests,
  FundExitAttachments,
  FundExitBookings,
  FundExits,
} from '../../../entities/fund-exit.entity';
import { Bookings } from '../../../entities/generated';
import { ExpenseRequestsModule } from '../expense-requests/expense-requests.module';
import { FundExitsController } from './fund-exits.controller';
import { FundExitsService } from './fund-exits.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FundExits,
      FundExitBookings,
      FundExitAttachments,
      ExpenseRequests,
      Bookings,
    ]),
    ExpenseRequestsModule,
  ],
  controllers: [FundExitsController],
  providers: [FundExitsService],
  exports: [FundExitsService],
})
export class FundExitsModule {}
