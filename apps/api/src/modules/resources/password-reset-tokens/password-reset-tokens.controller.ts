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
import { PasswordResetTokens } from '../../../entities/generated';
import { PasswordResetTokensService } from './password-reset-tokens.service';

@ApiTags('password-reset-tokens')
@Controller('password-reset-tokens')
export class PasswordResetTokensController {
  constructor(private readonly service: PasswordResetTokensService) {}

  @Get()
  @ApiOperation({ summary: 'List password-reset-tokens' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get password-reset-tokens by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create password-reset-tokens' })
  create(@Body() dto: DeepPartial<PasswordResetTokens>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update password-reset-tokens' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<PasswordResetTokens>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete password-reset-tokens' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
