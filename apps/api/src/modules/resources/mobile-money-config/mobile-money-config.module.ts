import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organizations } from '../../../entities/generated';
import { MobileMoneyCountries } from '../../../entities/mobile-money-country.entity';
import { MobileMoneyOperators } from '../../../entities/mobile-money-operator.entity';
import { MobileMoneyPaymentNumbers } from '../../../entities/mobile-money-payment-number.entity';
import { MobileMoneyConfigController } from './mobile-money-config.controller';
import { MobileMoneyConfigService } from './mobile-money-config.service';
import { PublicMobileMoneyConfigController } from './public-mobile-money-config.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MobileMoneyCountries,
      MobileMoneyOperators,
      MobileMoneyPaymentNumbers,
      Organizations,
    ]),
  ],
  controllers: [MobileMoneyConfigController, PublicMobileMoneyConfigController],
  providers: [MobileMoneyConfigService],
  exports: [MobileMoneyConfigService],
})
export class MobileMoneyConfigModule {}
