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
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { CurrenciesListQueryDto } from './dto/currencies-list-query.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { CurrenciesService } from './currencies.service';

@ApiTags('currencies')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('currencies')
export class CurrenciesController {
  constructor(private readonly service: CurrenciesService) {}

  @RequirePermissions(
    'currencies.read',
    'treasury.read',
    'accounting.read',
  )
  @Get()
  @ApiOperation({
    summary:
      'List platform currencies (paginated; activeOnly / search for selects)',
  })
  findAll(@Query() query: CurrenciesListQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions(
    'currencies.read',
    'treasury.read',
    'accounting.read',
  )
  @Get(':id')
  @ApiOperation({ summary: 'Get currency by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('currencies.write')
  @Post()
  @ApiOperation({ summary: 'Create platform currency (ISO 4217 code)' })
  create(@Body() dto: CreateCurrencyDto, @CurrentUser() user: AuthUserDto) {
    return this.service.createFromDto(dto, user.id);
  }

  @RequirePermissions('currencies.write')
  @Patch(':id')
  @ApiOperation({
    summary:
      'Update currency (cannot deactivate the last active catalog entry)',
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCurrencyDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.updateFromDto(id, dto, user.id);
  }

  @RequirePermissions('currencies.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete currency' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
    return this.service.remove(id, user.id);
  }
}
