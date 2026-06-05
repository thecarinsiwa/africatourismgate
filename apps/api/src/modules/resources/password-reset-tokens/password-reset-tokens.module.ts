import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordResetTokens } from '../../../entities/generated';
import { PasswordResetTokensController } from './password-reset-tokens.controller';
import { PasswordResetTokensService } from './password-reset-tokens.service';

@Module({
  imports: [TypeOrmModule.forFeature([PasswordResetTokens])],
  controllers: [PasswordResetTokensController],
  providers: [PasswordResetTokensService],
})
export class PasswordResetTokensModule {}
