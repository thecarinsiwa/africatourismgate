import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupportMessages } from '../../../entities/generated';
import { SupportMessagesController } from './support-messages.controller';
import { SupportMessagesService } from './support-messages.service';

@Module({
  imports: [TypeOrmModule.forFeature([SupportMessages])],
  controllers: [SupportMessagesController],
  providers: [SupportMessagesService],
})
export class SupportMessagesModule {}
