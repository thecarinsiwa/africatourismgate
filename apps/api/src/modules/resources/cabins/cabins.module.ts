import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cabins } from '../../../entities/generated';
import { CabinsController } from './cabins.controller';
import { CabinsService } from './cabins.service';

@Module({
  imports: [TypeOrmModule.forFeature([Cabins])],
  controllers: [CabinsController],
  providers: [CabinsService],
})
export class CabinsModule {}
