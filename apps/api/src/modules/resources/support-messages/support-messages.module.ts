import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  SupportMessages,
  SupportTickets,
} from '../../../entities/generated';
import { RbacModule } from '../../rbac/rbac.module';
import { SupportMessagesController } from './support-messages.controller';
import { SupportMessagesService } from './support-messages.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SupportMessages, SupportTickets]),
    RbacModule,
  ],
  controllers: [SupportMessagesController],
  providers: [SupportMessagesService],
})
export class SupportMessagesModule {}
