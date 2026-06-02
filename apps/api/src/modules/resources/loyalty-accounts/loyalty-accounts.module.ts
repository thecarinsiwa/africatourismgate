import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoyaltyAccounts, OrganizationSettings } from '../../../entities/generated';
import { LoyaltyAccountsController } from './loyalty-accounts.controller';
import { LoyaltyAccountsService } from './loyalty-accounts.service';

@Module({
  imports: [TypeOrmModule.forFeature([LoyaltyAccounts, OrganizationSettings])],
  controllers: [LoyaltyAccountsController],
  providers: [LoyaltyAccountsService],
  exports: [LoyaltyAccountsService],
})
export class LoyaltyAccountsModule {}
