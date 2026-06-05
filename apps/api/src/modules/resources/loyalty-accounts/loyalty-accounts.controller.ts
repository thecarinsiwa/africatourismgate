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
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import {
  CreateLoyaltyAccountDto,
  UpdateLoyaltyAccountDto,
} from './dto/loyalty-account.dto';
import { LoyaltyAccountsService } from './loyalty-accounts.service';

@ApiTags('loyalty-accounts')
@Controller('loyalty-accounts')
export class LoyaltyAccountsController {
  constructor(private readonly service: LoyaltyAccountsService) {}

  @Get()
  @ApiOperation({ summary: 'List loyalty accounts (scoped to current user unless staff)' })
  findAll(
    @Query() query: PaginationQueryDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.findAll(query, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get loyalty account by id' })
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
    return this.service.findOne(id, user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create loyalty account (staff only)' })
  create(@Body() dto: CreateLoyaltyAccountDto, @CurrentUser() user: AuthUserDto) {
    return this.service.create(dto, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update loyalty account (staff only)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateLoyaltyAccountDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.update(id, dto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete loyalty account (staff only)' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
    return this.service.remove(id, user.id);
  }
}
