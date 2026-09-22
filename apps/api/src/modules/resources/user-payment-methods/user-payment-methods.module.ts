import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPaymentMethods } from '../../../entities/generated';
import { RbacModule } from '../../rbac/rbac.module';
import { UserPaymentMethodsController } from './user-payment-methods.controller';
import { UserPaymentMethodsService } from './user-payment-methods.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserPaymentMethods]), RbacModule],
  controllers: [UserPaymentMethodsController],
  providers: [UserPaymentMethodsService],
})
export class UserPaymentMethodsModule {}
