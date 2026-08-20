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
import { EmailOperationVerifications } from '../../../entities/generated';
import { EmailOperationVerificationsService } from './email-operation-verifications.service';

@ApiTags('email-operation-verifications')
@Controller('email-operation-verifications')
export class EmailOperationVerificationsController {
  constructor(private readonly service: EmailOperationVerificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List email-operation-verifications' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get email-operation-verifications by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create email-operation-verifications' })
  create(@Body() dto: DeepPartial<EmailOperationVerifications>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update email-operation-verifications' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<EmailOperationVerifications>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete email-operation-verifications' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
