import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bookings, Users } from '../../entities/generated';
import { EmailOperationVerifications } from '../../entities/email-operation-verification.entity';
import { EmailAbandonmentScheduler } from './email-abandonment.scheduler';
import { EmailVerificationService } from './email-verification.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailOperationVerifications, Bookings, Users]),
  ],
  providers: [EmailVerificationService, EmailAbandonmentScheduler],
  exports: [EmailVerificationService],
})
export class EmailVerificationModule {}
