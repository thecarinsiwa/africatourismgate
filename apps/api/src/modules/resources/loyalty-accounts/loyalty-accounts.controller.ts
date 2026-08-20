import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DeepPartial } from 'typeorm';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { LoyaltyAccounts } from '../../../entities/generated';
import { LoyaltyAccountsService } from './loyalty-accounts.service';

@ApiTags('loyalty-accounts')
@Controller('loyalty-accounts')
export class LoyaltyAccountsController {
  constructor(private readonly service: LoyaltyAccountsService) {}

  @Get()
  @ApiOperation({ summary: 'List loyalty-accounts' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get loyalty-accounts by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create loyalty-accounts' })
  create(@Body() dto: DeepPartial<LoyaltyAccounts>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update loyalty-accounts' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<LoyaltyAccounts>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete loyalty-accounts' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
