import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Roles, UserRoleAssignments, Users } from '../../../entities/generated';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([Users, UserRoleAssignments, Roles])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
