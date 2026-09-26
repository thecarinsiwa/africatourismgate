import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  TreasuryAccessTokens,
  TreasuryExternalCollaborators,
} from '../../../entities/treasury-external.entity';
import { ExternalCollaboratorsController } from './external-collaborators.controller';
import { ExternalCollaboratorsService } from './external-collaborators.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TreasuryExternalCollaborators,
      TreasuryAccessTokens,
    ]),
  ],
  controllers: [ExternalCollaboratorsController],
  providers: [ExternalCollaboratorsService],
  exports: [ExternalCollaboratorsService],
})
export class ExternalCollaboratorsModule {}
