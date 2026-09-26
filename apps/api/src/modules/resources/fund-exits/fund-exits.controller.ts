import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
  StreamableFile,
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
import type { Response } from 'express';
import { diskStorage } from 'multer';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { AttachFundExitBookingsDto } from './dto/attach-fund-exit-bookings.dto';
import { CreateFundExitDto } from './dto/create-fund-exit.dto';
import { FundExitAttachmentDto } from './dto/fund-exit-attachment.dto';
import { FundExitsListQueryDto } from './dto/fund-exits-list-query.dto';
import { UpdateFundExitDto } from './dto/update-fund-exit.dto';
import {
  FUND_EXIT_ATTACHMENT_MAX_BYTES,
  FundExitsService,
  fundExitAttachmentFileFilter,
  fundExitAttachmentStorage,
} from './fund-exits.service';

@ApiTags('fund-exits')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('fund-exits')
export class FundExitsController {
  constructor(private readonly service: FundExitsService) {}

  @RequirePermissions('treasury.read')
  @Get()
  @ApiOperation({ summary: 'List fund exits (paginated, filtered)' })
  findAll(@Query() query: FundExitsListQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('treasury.read')
  @Get(':id/attachments')
  @ApiOperation({ summary: 'List attachments for a fund exit' })
  @ApiOkResponse({ type: [FundExitAttachmentDto] })
  listAttachments(@Param('id') id: string) {
    return this.service.listAttachments(id);
  }

  @RequirePermissions('treasury.read')
  @Get(':id/attachments/:attachmentId/file')
  @ApiOperation({ summary: 'Download fund exit attachment file' })
  async downloadAttachment(
    @Param('id') id: string,
    @Param('attachmentId') attachmentId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { file, mimeType, filename } =
      await this.service.getAttachmentFileStream(id, attachmentId);
    res.setHeader('Content-Type', mimeType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(filename)}"`,
    );
    return file;
  }

  @RequirePermissions('treasury.exits.write')
  @Post(':id/attachments')
  @HttpCode(HttpStatus.CREATED)
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
      storage: diskStorage(fundExitAttachmentStorage()),
      limits: { fileSize: FUND_EXIT_ATTACHMENT_MAX_BYTES },
      fileFilter: fundExitAttachmentFileFilter,
    }),
  )
  @ApiOperation({
    summary: 'Upload fund exit attachment (JPEG, PNG, WebP or PDF, max 10 MB)',
  })
  @ApiOkResponse({ type: FundExitAttachmentDto })
  uploadAttachment(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() user: AuthUserDto,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Fichier requis (JPEG, PNG, WebP ou PDF, max 10 Mo).',
      );
    }
    return this.service.uploadAttachment(id, file, user.id);
  }

  @RequirePermissions('treasury.exits.write')
  @Delete(':id/attachments/:attachmentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete fund exit attachment' })
  removeAttachment(
    @Param('id') id: string,
    @Param('attachmentId') attachmentId: string,
  ) {
    return this.service.softDeleteAttachment(id, attachmentId);
  }

  @RequirePermissions('treasury.exits.write')
  @Post(':id/bookings')
  @ApiOperation({
    summary: 'Attach booking(s) to a fund exit (additive, 0..N)',
  })
  attachBookings(
    @Param('id') id: string,
    @Body() dto: AttachFundExitBookingsDto,
  ) {
    return this.service.attachBookings(id, dto.bookingIds);
  }

  @RequirePermissions('treasury.exits.write')
  @Delete(':id/bookings/:bookingId')
  @ApiOperation({ summary: 'Detach a booking from a fund exit' })
  detachBooking(
    @Param('id') id: string,
    @Param('bookingId') bookingId: string,
  ) {
    return this.service.detachBooking(id, bookingId);
  }

  @RequirePermissions('treasury.read')
  @Get(':id')
  @ApiOperation({
    summary: 'Get fund exit by id (with bookingIds + attachments)',
  })
  findOne(@Param('id') id: string) {
    return this.service.findOneDto(id);
  }

  @RequirePermissions('treasury.exits.write')
  @Post()
  @ApiOperation({
    summary:
      'Create fund exit (requires expense request with status = authorized)',
  })
  create(
    @Body() dto: CreateFundExitDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.createFromDto(dto, user.id);
  }

  @RequirePermissions('treasury.exits.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update fund exit' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateFundExitDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.updateFromDto(id, dto, user.id);
  }

  @RequirePermissions('treasury.exits.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete draft fund exit' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
    return this.service.remove(id, user.id);
  }
}
