import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Organizations,
  Properties,
  RentalAgencies,
  Roles,
  UserRoleAssignments,
  Users,
} from '../../../entities/generated';
import { UserRoleAssignmentsController } from './user-role-assignments.controller';
import { UserRoleAssignmentsService } from './user-role-assignments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserRoleAssignments,
      Users,
      Roles,
      Properties,
      RentalAgencies,
      Organizations,
    ]),
  ],
  controllers: [UserRoleAssignmentsController],
  providers: [UserRoleAssignmentsService],
})
export class UserRoleAssignmentsModule {}
