import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationBankAccounts } from '../../../entities/generated';
import { OrganizationBankAccountsController } from './organization-bank-accounts.controller';
import { OrganizationBankAccountsService } from './organization-bank-accounts.service';

@Module({
  imports: [TypeOrmModule.forFeature([OrganizationBankAccounts])],
  controllers: [OrganizationBankAccountsController],
  providers: [OrganizationBankAccountsService],
})
export class OrganizationBankAccountsModule {}
