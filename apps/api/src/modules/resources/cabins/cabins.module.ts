import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cabins, Ships } from '../../../entities/generated';
import { CabinsController } from './cabins.controller';
import { CabinsService } from './cabins.service';

@Module({
  imports: [TypeOrmModule.forFeature([Cabins, Ships])],
  controllers: [CabinsController],
  providers: [CabinsService],
})
export class CabinsModule {}
