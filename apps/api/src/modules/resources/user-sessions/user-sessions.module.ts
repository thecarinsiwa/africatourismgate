import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSessions } from '../../../entities/generated';
import { RbacModule } from '../../rbac/rbac.module';
import { UserSessionsController } from './user-sessions.controller';
import { UserSessionsService } from './user-sessions.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserSessions]), RbacModule],
  controllers: [UserSessionsController],
  providers: [UserSessionsService],
})
export class UserSessionsModule {}
