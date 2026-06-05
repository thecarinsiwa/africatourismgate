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
import { OrganizationBankAccounts } from '../../../entities/generated';
import { OrganizationBankAccountsService } from './organization-bank-accounts.service';

@ApiTags('organization-bank-accounts')
@Controller('organization-bank-accounts')
export class OrganizationBankAccountsController {
  constructor(private readonly service: OrganizationBankAccountsService) {}

  @Get()
  @ApiOperation({ summary: 'List organization-bank-accounts' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get organization-bank-accounts by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create organization-bank-accounts' })
  create(@Body() dto: DeepPartial<OrganizationBankAccounts>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update organization-bank-accounts' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<OrganizationBankAccounts>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete organization-bank-accounts' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
