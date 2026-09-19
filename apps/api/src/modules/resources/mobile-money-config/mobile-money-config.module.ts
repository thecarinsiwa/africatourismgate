import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MobileMoneyCountries } from '../../../entities/mobile-money-country.entity';
import { MobileMoneyOperators } from '../../../entities/mobile-money-operator.entity';
import { MobileMoneyPaymentNumbers } from '../../../entities/mobile-money-payment-number.entity';
import { MobileMoneyConfigController } from './mobile-money-config.controller';
import { MobileMoneyConfigService } from './mobile-money-config.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MobileMoneyCountries,
      MobileMoneyOperators,
      MobileMoneyPaymentNumbers,
    ]),
  ],
  controllers: [MobileMoneyConfigController],
  providers: [MobileMoneyConfigService],
  exports: [MobileMoneyConfigService],
})
export class MobileMoneyConfigModule {}
