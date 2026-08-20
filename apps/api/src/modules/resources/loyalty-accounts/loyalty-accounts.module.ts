import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoyaltyAccounts } from '../../../entities/generated';
import { LoyaltyAccountsController } from './loyalty-accounts.controller';
import { LoyaltyAccountsService } from './loyalty-accounts.service';

@Module({
  imports: [TypeOrmModule.forFeature([LoyaltyAccounts])],
  controllers: [LoyaltyAccountsController],
  providers: [LoyaltyAccountsService],
})
export class LoyaltyAccountsModule {}
