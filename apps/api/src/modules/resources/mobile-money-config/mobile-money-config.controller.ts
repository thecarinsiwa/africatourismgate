import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { mobileMoneyUploadUrl } from '../../../common/utils/public-asset-url';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { CreateMobileMoneyCountryDto } from './dto/create-mobile-money-country.dto';
import { CreateMobileMoneyOperatorDto } from './dto/create-mobile-money-operator.dto';
import { CreateMobileMoneyPaymentNumberDto } from './dto/create-mobile-money-payment-number.dto';
import {
  MobileMoneyCountriesListQueryDto,
  MobileMoneyOperatorsListQueryDto,
  MobileMoneyPaymentNumbersListQueryDto,
  MobileMoneyScopedQueryDto,
} from './dto/mobile-money-list-query.dto';
import {
  MobileMoneyCountryDto,
  MobileMoneyOperatorDto,
  MobileMoneyPaymentNumberDto,
} from './dto/mobile-money.dto';
import { UpdateMobileMoneyCountryDto } from './dto/update-mobile-money-country.dto';
import { UpdateMobileMoneyOperatorDto } from './dto/update-mobile-money-operator.dto';
import { UpdateMobileMoneyPaymentNumberDto } from './dto/update-mobile-money-payment-number.dto';
import { MobileMoneyConfigService } from './mobile-money-config.service';

const LOGO_MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_LOGO_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_LOGO_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

@ApiTags('mobile-money')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('mobile-money')
export class MobileMoneyConfigController {
  constructor(private readonly service: MobileMoneyConfigService) {}

  // ── Countries ──────────────────────────────────────────────────────────

  @Get('countries')
  @RequirePermissions('mobile_money.read')
  @ApiOperation({ summary: 'List Mobile Money countries (org-scoped)' })
  @ApiOkResponse({ type: [MobileMoneyCountryDto] })
  listCountries(
    @Query() query: MobileMoneyCountriesListQueryDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.listCountries(query, user);
  }

  @Get('countries/:id')
  @RequirePermissions('mobile_money.read')
  @ApiOperation({ summary: 'Get Mobile Money country by id' })
  getCountry(
    @Param('id') id: string,
    @Query() query: MobileMoneyScopedQueryDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.findCountryDto(id, user, query.organizationId);
  }

  @Post('countries')
  @RequirePermissions('mobile_money.write')
  @ApiOperation({ summary: 'Create Mobile Money country' })
  createCountry(
    @Body() dto: CreateMobileMoneyCountryDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.createCountry(dto, user);
  }

  @Patch('countries/:id')
  @RequirePermissions('mobile_money.write')
  @ApiOperation({ summary: 'Update Mobile Money country' })
  updateCountry(
    @Param('id') id: string,
    @Body() dto: UpdateMobileMoneyCountryDto,
    @Query() query: MobileMoneyScopedQueryDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.updateCountry(id, dto, user, query.organizationId);
  }

  @Delete('countries/:id')
  @RequirePermissions('mobile_money.write')
  @ApiOperation({ summary: 'Soft-delete Mobile Money country' })
  removeCountry(
    @Param('id') id: string,
    @Query() query: MobileMoneyScopedQueryDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.removeCountry(id, user, query.organizationId);
  }

  // ── Operators ──────────────────────────────────────────────────────────

  @Get('operators')
  @RequirePermissions('mobile_money.read')
  @ApiOperation({ summary: 'List Mobile Money operators for a country' })
  @ApiOkResponse({ type: [MobileMoneyOperatorDto] })
  listOperators(
    @Query() query: MobileMoneyOperatorsListQueryDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.listOperators(query, user);
  }

  @Get('operators/:id')
  @RequirePermissions('mobile_money.read')
  @ApiOperation({ summary: 'Get Mobile Money operator by id' })
  getOperator(
    @Param('id') id: string,
    @Query() query: MobileMoneyScopedQueryDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.findOperatorDto(id, user, query.organizationId);
  }

  @Post('operators')
  @RequirePermissions('mobile_money.write')
  @ApiOperation({ summary: 'Create Mobile Money operator' })
  createOperator(
    @Body() dto: CreateMobileMoneyOperatorDto,
    @Query() query: MobileMoneyScopedQueryDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.createOperator(dto, user, query.organizationId);
  }

  @Patch('operators/:id')
  @RequirePermissions('mobile_money.write')
  @ApiOperation({ summary: 'Update Mobile Money operator' })
  updateOperator(
    @Param('id') id: string,
    @Body() dto: UpdateMobileMoneyOperatorDto,
    @Query() query: MobileMoneyScopedQueryDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.updateOperator(id, dto, user, query.organizationId);
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const uploadDir = join(process.cwd(), 'uploads', 'mobile-money');
          if (!existsSync(uploadDir)) {
            mkdirSync(uploadDir, { recursive: true });
          }
          cb(null, uploadDir);
        },
        filename: (_req, file, cb) => {
          const extension = extname(file.originalname || '').toLowerCase();
          cb(null, `${Date.now()}-${randomUUID()}${extension}`);
        },
      }),
      limits: { fileSize: LOGO_MAX_BYTES },
      fileFilter: (_req, file, cb) => {
        const extension = extname(file.originalname || '').toLowerCase();
        if (
          !ALLOWED_LOGO_MIMES.has(file.mimetype) ||
          !ALLOWED_LOGO_EXTENSIONS.has(extension)
        ) {
          cb(null, false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  @Post('operators/:id/upload-logo')
  @RequirePermissions('mobile_money.write')
  @ApiOperation({ summary: 'Upload Mobile Money operator logo (JPEG/PNG/WebP, max 2 MB)' })
  async uploadOperatorLogo(
    @Param('id') id: string,
    @Query() query: MobileMoneyScopedQueryDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() user: AuthUserDto,
  ): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException(
        'Fichier image requis (JPEG, PNG ou WebP, max 2 Mo).',
      );
    }
    const url = mobileMoneyUploadUrl(file.filename);
    await this.service.setOperatorLogo(id, url, user, query.organizationId);
    return { url };
  }

  @Delete('operators/:id')
  @RequirePermissions('mobile_money.write')
  @ApiOperation({ summary: 'Soft-delete Mobile Money operator' })
  removeOperator(
    @Param('id') id: string,
    @Query() query: MobileMoneyScopedQueryDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.removeOperator(id, user, query.organizationId);
  }

  // ── Payment numbers ────────────────────────────────────────────────────

  @Get('numbers')
  @RequirePermissions('mobile_money.read')
  @ApiOperation({ summary: 'List Mobile Money payment numbers for an operator' })
  @ApiOkResponse({ type: [MobileMoneyPaymentNumberDto] })
  listNumbers(
    @Query() query: MobileMoneyPaymentNumbersListQueryDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.listNumbers(query, user);
  }

  @Get('numbers/:id')
  @RequirePermissions('mobile_money.read')
  @ApiOperation({ summary: 'Get Mobile Money payment number by id' })
  getNumber(
    @Param('id') id: string,
    @Query() query: MobileMoneyScopedQueryDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.findNumberDto(id, user, query.organizationId);
  }

  @Post('numbers')
  @RequirePermissions('mobile_money.write')
  @ApiOperation({ summary: 'Create Mobile Money payment number' })
  createNumber(
    @Body() dto: CreateMobileMoneyPaymentNumberDto,
    @Query() query: MobileMoneyScopedQueryDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.createNumber(dto, user, query.organizationId);
  }

  @Patch('numbers/:id')
  @RequirePermissions('mobile_money.write')
  @ApiOperation({ summary: 'Update Mobile Money payment number' })
  updateNumber(
    @Param('id') id: string,
    @Body() dto: UpdateMobileMoneyPaymentNumberDto,
    @Query() query: MobileMoneyScopedQueryDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.updateNumber(id, dto, user, query.organizationId);
  }

  @Delete('numbers/:id')
  @RequirePermissions('mobile_money.write')
  @ApiOperation({ summary: 'Soft-delete Mobile Money payment number' })
  removeNumber(
    @Param('id') id: string,
    @Query() query: MobileMoneyScopedQueryDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.removeNumber(id, user, query.organizationId);
  }
}
