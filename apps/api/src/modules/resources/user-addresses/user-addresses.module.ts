import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAddresses } from '../../../entities/generated';
import { RbacModule } from '../../rbac/rbac.module';
import { UserAddressesController } from './user-addresses.controller';
import { UserAddressesService } from './user-addresses.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserAddresses]), RbacModule],
  controllers: [UserAddressesController],
  providers: [UserAddressesService],
})
export class UserAddressesModule {}
