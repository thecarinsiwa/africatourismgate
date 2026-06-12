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
import {
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import {
  CreateUserPaymentMethodDto,
  UpdateUserPaymentMethodDto,
  UserPaymentMethodDto,
} from './dto/user-payment-method.dto';
import { UserPaymentMethodsListQueryDto } from './dto/user-payment-methods-list-query.dto';
import { UserPaymentMethodsService } from './user-payment-methods.service';

@ApiTags('user-payment-methods')
@ApiForbiddenResponse({ description: 'Missing permission or access denied' })
@Controller('user-payment-methods')
export class UserPaymentMethodsController {
  constructor(private readonly service: UserPaymentMethodsService) {}

  @Get()
  @ApiOperation({
    summary: 'List user payment methods (scoped to current user unless staff)',
  })
  findAll(
    @Query() query: UserPaymentMethodsListQueryDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.findAll(query, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user payment method by id' })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthUserDto,
  ): Promise<UserPaymentMethodDto> {
    return this.service.findOne(id, user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create user payment method' })
  create(
    @Body() dto: CreateUserPaymentMethodDto,
    @CurrentUser() user: AuthUserDto,
  ): Promise<UserPaymentMethodDto> {
    return this.service.create(dto, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user payment method' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserPaymentMethodDto,
    @CurrentUser() user: AuthUserDto,
  ): Promise<UserPaymentMethodDto> {
    return this.service.update(id, dto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete user payment method' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
    return this.service.remove(id, user.id);
  }
}
