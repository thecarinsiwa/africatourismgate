import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  OrganizationBankAccounts,
  Organizations,
} from '../../../entities/generated';
import { OrganizationBankAccountsController } from './organization-bank-accounts.controller';
import { OrganizationBankAccountsService } from './organization-bank-accounts.service';
import { PublicPaymentBankAccountsController } from './public-payment-bank-accounts.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OrganizationBankAccounts, Organizations])],
  controllers: [
    OrganizationBankAccountsController,
    PublicPaymentBankAccountsController,
  ],
  providers: [OrganizationBankAccountsService],
  exports: [OrganizationBankAccountsService],
})
export class OrganizationBankAccountsModule {}
