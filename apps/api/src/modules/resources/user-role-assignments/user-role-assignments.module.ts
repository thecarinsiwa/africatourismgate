import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRoleAssignments } from '../../../entities/generated';
import { UserRoleAssignmentsController } from './user-role-assignments.controller';
import { UserRoleAssignmentsService } from './user-role-assignments.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserRoleAssignments])],
  controllers: [UserRoleAssignmentsController],
  providers: [UserRoleAssignmentsService],
})
export class UserRoleAssignmentsModule {}
