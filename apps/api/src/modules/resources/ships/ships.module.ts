import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ships } from '../../../entities/generated';
import { ShipsController } from './ships.controller';
import { ShipsService } from './ships.service';

@Module({
  imports: [TypeOrmModule.forFeature([Ships])],
  controllers: [ShipsController],
  providers: [ShipsService],
})
export class ShipsModule {}
