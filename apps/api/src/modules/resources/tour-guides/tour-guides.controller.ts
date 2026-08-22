import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { tourGuideUploadUrl } from '../../../common/utils/public-asset-url';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { BookingGuideAssignmentsService } from './booking-guide-assignments.service';
import { CreateTourGuideDto } from './dto/create-tour-guide.dto';
import { TourGuideCalendarDayQueryDto } from './dto/tour-guide-calendar-day-query.dto';
import { TourGuideCalendarSummaryQueryDto } from './dto/tour-guide-calendar-summary-query.dto';
import { UpsertGuideAvailabilityDto } from './dto/upsert-guide-availability.dto';
import { TourGuideBookingsListQueryDto } from './dto/tour-guide-bookings-list-query.dto';
import { TourGuidesListQueryDto } from './dto/tour-guides-list-query.dto';
import { UpdateTourGuideDto } from './dto/update-tour-guide.dto';
import { GuideAvailabilityService } from './guide-availability.service';
import { TourGuidesService } from './tour-guides.service';

const PHOTO_MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_PHOTO_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_PHOTO_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

@ApiTags('tour-guides')
@ApiForbiddenResponse({ description: 'Permission manquante' })
@Controller('tour-guides')
export class TourGuidesController {
  constructor(
    private readonly service: TourGuidesService,
    private readonly bookingGuideAssignmentsService: BookingGuideAssignmentsService,
    private readonly guideAvailabilityService: GuideAvailabilityService,
  ) {}

  @Get()
  @RequirePermissions('guides.read')
  @ApiOperation({ summary: 'Liste paginée des guides touristiques' })
  findAll(@Query() query: TourGuidesListQueryDto) {
    return this.service.list(query);
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
          const uploadDir = join(process.cwd(), 'uploads', 'tour-guides');
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
      limits: { fileSize: PHOTO_MAX_BYTES },
      fileFilter: (_req, file, cb) => {
        const extension = extname(file.originalname || '').toLowerCase();
        if (
          !ALLOWED_PHOTO_MIMES.has(file.mimetype) ||
          !ALLOWED_PHOTO_EXTENSIONS.has(extension)
        ) {
          cb(null, false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  @Post('upload-photo')
  @RequirePermissions('guides.write')
  @ApiOperation({ summary: 'Upload d’une photo de guide (JPEG, PNG ou WebP, max 5 Mo)' })
  uploadPhoto(
    @UploadedFile() file: Express.Multer.File | undefined,
  ): { url: string } {
    if (!file) {
      throw new BadRequestException(
        'Fichier image requis (JPEG, PNG ou WebP, max 5 Mo).',
      );
    }
    return { url: tourGuideUploadUrl(file.filename) };
  }

  @Get('calendar/summary')
  @RequirePermissions('guides.read')
  @ApiOperation({ summary: 'Synthèse calendrier : disponibilité des guides par jour' })
  getCalendarSummary(@Query() query: TourGuideCalendarSummaryQueryDto) {
    return this.guideAvailabilityService.getCalendarSummary(query);
  }

  @Get('calendar/day')
  @RequirePermissions('guides.read')
  @ApiOperation({ summary: 'Détail calendrier pour un jour (statut par guide)' })
  getCalendarDay(@Query() query: TourGuideCalendarDayQueryDto) {
    return this.guideAvailabilityService.getCalendarDay(query);
  }

  @Put(':guideId/availability')
  @RequirePermissions('guides.write')
  @ApiOperation({ summary: 'Définir la disponibilité d’un guide pour une date' })
  upsertAvailability(
    @Param('guideId') guideId: string,
    @Body() dto: UpsertGuideAvailabilityDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.guideAvailabilityService.upsertAvailability(guideId, dto, user.id);
  }

  @Get(':id/bookings')
  @RequirePermissions('guides.read')
  @ApiOperation({ summary: 'Liste paginée des réservations assignées à un guide' })
  listBookings(
    @Param('id') id: string,
    @Query() query: TourGuideBookingsListQueryDto,
  ) {
    return this.bookingGuideAssignmentsService.listByGuideId(id, query);
  }

  @Get(':id')
  @RequirePermissions('guides.read')
  @ApiOperation({ summary: 'Détail d’un guide touristique' })
  findOne(@Param('id') id: string) {
    return this.service.findOneDto(id);
  }

  @Post()
  @RequirePermissions('guides.write')
  @ApiOperation({ summary: 'Créer un guide touristique' })
  create(@Body() dto: CreateTourGuideDto, @CurrentUser() user: AuthUserDto) {
    return this.service.createFromDto(dto, user.id);
  }

  @Patch(':id')
  @RequirePermissions('guides.write')
  @ApiOperation({ summary: 'Mettre à jour un guide touristique' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTourGuideDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.updateFromDto(id, dto, user.id);
  }

  @Delete(':id')
  @RequirePermissions('guides.write')
  @ApiOperation({ summary: 'Suppression logique d’un guide touristique' })
  async remove(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
    await this.service.removeDto(id, user.id);
  }
}
