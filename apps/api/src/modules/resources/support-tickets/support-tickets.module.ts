import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  SupportMessages,
  SupportTickets,
  Users,
} from '../../../entities/generated';
import { RbacModule } from '../../rbac/rbac.module';
import { SupportTicketsController } from './support-tickets.controller';
import { SupportTicketsService } from './support-tickets.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SupportTickets, SupportMessages, Users]),
    RbacModule,
  ],
  controllers: [SupportTicketsController],
  providers: [SupportTicketsService],
})
export class SupportTicketsModule {}
