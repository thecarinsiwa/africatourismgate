import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ExpenseRequests,
  FundExitBookings,
  FundExits,
} from '../../../entities/fund-exit.entity';
import { Bookings } from '../../../entities/generated';
import { FundExitsController } from './fund-exits.controller';
import { FundExitsService } from './fund-exits.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FundExits,
      FundExitBookings,
      ExpenseRequests,
      Bookings,
    ]),
  ],
  controllers: [FundExitsController],
  providers: [FundExitsService],
  exports: [FundExitsService],
})
export class FundExitsModule {}
