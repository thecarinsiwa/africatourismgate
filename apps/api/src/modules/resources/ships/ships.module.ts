import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CruiseLines, Ships } from '../../../entities/generated';
import { ShipsController } from './ships.controller';
import { ShipsService } from './ships.service';

@Module({
  imports: [TypeOrmModule.forFeature([Ships, CruiseLines])],
  controllers: [ShipsController],
  providers: [ShipsService],
})
export class ShipsModule {}
