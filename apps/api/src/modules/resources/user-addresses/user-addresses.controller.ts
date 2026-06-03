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
  CreateUserAddressDto,
  UpdateUserAddressDto,
} from './dto/user-address.dto';
import { UserAddressesService } from './user-addresses.service';

@ApiTags('user-addresses')
@Controller('user-addresses')
export class UserAddressesController {
  constructor(private readonly service: UserAddressesService) {}

  @Get()
  @ApiOperation({ summary: 'List user-addresses' })
  findAll(
    @Query() query: PaginationQueryDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.findAll(query, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user-addresses by id' })
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
    return this.service.findOne(id, user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create user-addresses' })
  create(@Body() dto: CreateUserAddressDto, @CurrentUser() user: AuthUserDto) {
    return this.service.create(dto, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user-addresses' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserAddressDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.update(id, dto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete user-addresses' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
    return this.service.remove(id, user.id);
  }
}
