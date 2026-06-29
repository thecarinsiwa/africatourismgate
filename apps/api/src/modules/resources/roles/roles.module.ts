import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permissions, RolePermissions, Roles } from '../../../entities/generated';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

@Module({
  imports: [TypeOrmModule.forFeature([Roles, RolePermissions, Permissions])],
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}
