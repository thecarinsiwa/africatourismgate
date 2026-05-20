import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Roles, Users, UserRoleAssignments } from '../../../entities/generated';
import { UserRoleAssignmentsController } from './user-role-assignments.controller';
import { UserRoleAssignmentsService } from './user-role-assignments.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserRoleAssignments, Users, Roles])],
  controllers: [UserRoleAssignmentsController],
  providers: [UserRoleAssignmentsService],
  exports: [UserRoleAssignmentsService],
})
export class UserRoleAssignmentsModule {}
