import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AccountingExercises,
  AccountingPeriods,
} from '../../../entities/accounting-exercise.entity';
import { AccountingExercisesController } from './accounting-exercises.controller';
import { AccountingExercisesService } from './accounting-exercises.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AccountingExercises, AccountingPeriods]),
  ],
  controllers: [AccountingExercisesController],
  providers: [AccountingExercisesService],
  exports: [AccountingExercisesService],
})
export class AccountingExercisesModule {}
