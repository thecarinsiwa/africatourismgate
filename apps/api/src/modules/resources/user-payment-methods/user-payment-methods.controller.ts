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
  CreateUserPaymentMethodDto,
  UpdateUserPaymentMethodDto,
} from './dto/user-payment-method.dto';
import { UserPaymentMethodsService } from './user-payment-methods.service';

@ApiTags('user-payment-methods')
@Controller('user-payment-methods')
export class UserPaymentMethodsController {
  constructor(private readonly service: UserPaymentMethodsService) {}

  @Get()
  @ApiOperation({ summary: 'List user-payment-methods' })
  findAll(
    @Query() query: PaginationQueryDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.findAll(query, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user-payment-methods by id' })
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
    return this.service.findOne(id, user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create user-payment-methods' })
  create(
    @Body() dto: CreateUserPaymentMethodDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.create(dto, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user-payment-methods' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserPaymentMethodDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.update(id, dto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete user-payment-methods' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
    return this.service.remove(id, user.id);
  }
}
