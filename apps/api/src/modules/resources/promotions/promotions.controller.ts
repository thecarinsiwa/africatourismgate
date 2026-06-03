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
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { PromotionsListQueryDto } from './dto/promotions-list-query.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { PromotionsService } from './promotions.service';

@ApiTags('promotions')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly service: PromotionsService) {}

  @Get()
  @RequirePermissions('promo_codes.read')
  @ApiOperation({ summary: 'List promotions (search by name/description)' })
  findAll(@Query() query: PromotionsListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('promo_codes.read')
  @ApiOperation({ summary: 'Get promotion by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermissions('promo_codes.write')
  @ApiOperation({ summary: 'Create promotion campaign' })
  create(@Body() dto: CreatePromotionDto, @CurrentUser() user: AuthUserDto) {
    return this.service.createPromotion(dto, user.id);
  }

  @Patch(':id')
  @RequirePermissions('promo_codes.write')
  @ApiOperation({ summary: 'Update promotion' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePromotionDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.updatePromotion(id, dto, user.id);
  }

  @Delete(':id')
  @RequirePermissions('promo_codes.write')
  @ApiOperation({ summary: 'Soft-delete promotion' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
    return this.service.remove(id, user.id);
  }
}
