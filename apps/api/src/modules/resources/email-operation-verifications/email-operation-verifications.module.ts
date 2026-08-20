import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailOperationVerifications } from '../../../entities/generated';
import { EmailOperationVerificationsController } from './email-operation-verifications.controller';
import { EmailOperationVerificationsService } from './email-operation-verifications.service';

@Module({
  imports: [TypeOrmModule.forFeature([EmailOperationVerifications])],
  controllers: [EmailOperationVerificationsController],
  providers: [EmailOperationVerificationsService],
})
export class EmailOperationVerificationsModule {}
