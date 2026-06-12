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
  CreateUserAddressDto,
  UpdateUserAddressDto,
  UserAddressDto,
} from './dto/user-address.dto';
import { UserAddressesListQueryDto } from './dto/user-addresses-list-query.dto';
import { UserAddressesService } from './user-addresses.service';

@ApiTags('user-addresses')
@ApiForbiddenResponse({ description: 'Missing permission or access denied' })
@Controller('user-addresses')
export class UserAddressesController {
  constructor(private readonly service: UserAddressesService) {}

  @Get()
  @ApiOperation({ summary: 'List user addresses (scoped to current user unless staff)' })
  findAll(
    @Query() query: UserAddressesListQueryDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.findAll(query, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user address by id' })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthUserDto,
  ): Promise<UserAddressDto> {
    return this.service.findOne(id, user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create user address' })
  create(
    @Body() dto: CreateUserAddressDto,
    @CurrentUser() user: AuthUserDto,
  ): Promise<UserAddressDto> {
    return this.service.create(dto, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user address' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserAddressDto,
    @CurrentUser() user: AuthUserDto,
  ): Promise<UserAddressDto> {
    return this.service.update(id, dto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete user address' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
    return this.service.remove(id, user.id);
  }
}
