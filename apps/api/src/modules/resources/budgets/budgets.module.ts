import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Budgets } from '../../../entities/budget.entity';
import { FundExits } from '../../../entities/fund-exit.entity';
import {
  Activities,
  ActivitySchedules,
  Cabins,
  FlightClasses,
  Packages,
  Rooms,
  Vehicles,
} from '../../../entities/generated';
import { CurrenciesModule } from '../currencies/currencies.module';
import { BudgetsController } from './budgets.controller';
import { BudgetsService } from './budgets.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Budgets,
      FundExits,
      Activities,
      ActivitySchedules,
      Packages,
      Rooms,
      FlightClasses,
      Vehicles,
      Cabins,
    ]),
    CurrenciesModule,
  ],
  controllers: [BudgetsController],
  providers: [BudgetsService],
  exports: [BudgetsService],
})
export class BudgetsModule {}
