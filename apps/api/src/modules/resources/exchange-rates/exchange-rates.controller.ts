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
import { CreateExchangeRateDto } from './dto/create-exchange-rate.dto';
import { ExchangeRatesListQueryDto } from './dto/exchange-rates-list-query.dto';
import { UpdateExchangeRateDto } from './dto/update-exchange-rate.dto';
import { ExchangeRatesService } from './exchange-rates.service';

@ApiTags('exchange-rates')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('exchange-rates')
export class ExchangeRatesController {
  constructor(private readonly service: ExchangeRatesService) {}

  @RequirePermissions('treasury.fx_rates.read')
  @Get()
  @ApiOperation({
    summary: 'List exchange rates (paginated; filter org / pair / dates)',
  })
  findAll(@Query() query: ExchangeRatesListQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('treasury.fx_rates.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get exchange rate by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('treasury.fx_rates.write')
  @Post()
  @ApiOperation({
    summary:
      'Create exchange rate (1 fromCurrency = rate × toCurrency; unique per org/pair/date)',
  })
  create(
    @Body() dto: CreateExchangeRateDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.createFromDto(dto, user.id);
  }

  @RequirePermissions('treasury.fx_rates.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update exchange rate' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateExchangeRateDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.updateFromDto(id, dto, user.id);
  }

  @RequirePermissions('treasury.fx_rates.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete exchange rate' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
    return this.service.remove(id, user.id);
  }
}
