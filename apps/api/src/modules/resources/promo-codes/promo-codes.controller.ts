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
import { ApiForbiddenResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { PromoCodesListQueryDto } from './dto/promo-codes-list-query.dto';
import { UpdatePromoCodeDto } from './dto/update-promo-code.dto';
import { PromoCodesService } from './promo-codes.service';

@ApiTags('promo-codes')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('promo-codes')
export class PromoCodesController {
  constructor(private readonly service: PromoCodesService) {}

  @Get()
  @RequirePermissions('promo_codes.read')
  @ApiOperation({ summary: 'List promo codes (search by code)' })
  findAll(@Query() query: PromoCodesListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('promo_codes.read')
  @ApiOperation({ summary: 'Get promo code by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermissions('promo_codes.write')
  @ApiOperation({ summary: 'Create promo code' })
  create(@Body() dto: CreatePromoCodeDto, @CurrentUser() user: AuthUserDto) {
    return this.service.createPromoCode(dto, user.id);
  }

  @Patch(':id')
  @RequirePermissions('promo_codes.write')
  @ApiOperation({ summary: 'Update promo code' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePromoCodeDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.updatePromoCode(id, dto, user.id);
  }

  @Delete(':id')
  @RequirePermissions('promo_codes.write')
  @ApiOperation({ summary: 'Soft-delete promo code' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
    return this.service.remove(id, user.id);
  }
}
