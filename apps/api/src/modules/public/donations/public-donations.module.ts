import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Donations } from '../../../entities/donation.entity';
import { PublicDonationsController } from './public-donations.controller';
import { PublicDonationsService } from './public-donations.service';

@Module({
  imports: [TypeOrmModule.forFeature([Donations])],
  controllers: [PublicDonationsController],
  providers: [PublicDonationsService],
})
export class PublicDonationsModule {}
