import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employees, Organizations, Users } from '../../../entities/generated';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';

@Module({
  imports: [TypeOrmModule.forFeature([Employees, Users, Organizations])],
  controllers: [EmployeesController],
  providers: [EmployeesService],
})
export class EmployeesModule {}
