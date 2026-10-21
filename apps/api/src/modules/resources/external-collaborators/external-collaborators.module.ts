import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  TreasuryAccessTokens,
  TreasuryExternalCollaborators,
} from '../../../entities/treasury-external.entity';
import { TreasuryAuditModule } from '../treasury-audit/treasury-audit.module';
import { ExternalCollaboratorsController } from './external-collaborators.controller';
import { ExternalCollaboratorsService } from './external-collaborators.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TreasuryExternalCollaborators,
      TreasuryAccessTokens,
    ]),
    TreasuryAuditModule,
  ],
  controllers: [ExternalCollaboratorsController],
  providers: [ExternalCollaboratorsService],
  exports: [ExternalCollaboratorsService],
})
export class ExternalCollaboratorsModule {}
