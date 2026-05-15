import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Packages } from '../../../entities/generated';
import { PackagesController } from './packages.controller';
import { PackagesService } from './packages.service';

@Module({
  imports: [TypeOrmModule.forFeature([Packages])],
  controllers: [PackagesController],
  providers: [PackagesService],
})
export class PackagesModule {}
