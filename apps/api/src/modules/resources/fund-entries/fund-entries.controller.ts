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
import { AttachFundEntryBookingsDto } from './dto/attach-fund-entry-bookings.dto';
import { CreateFundEntryDto } from './dto/create-fund-entry.dto';
import { FundEntriesListQueryDto } from './dto/fund-entries-list-query.dto';
import { FundEntryAttachmentDto } from './dto/fund-entry-attachment.dto';
import { UpdateFundEntryDto } from './dto/update-fund-entry.dto';
import { VoidTreasuryOperationDto } from './dto/void-treasury-operation.dto';
import {
  FUND_ENTRY_ATTACHMENT_MAX_BYTES,
  FundEntriesService,
  fundEntryAttachmentFileFilter,
  fundEntryAttachmentStorage,
} from './fund-entries.service';

@ApiTags('fund-entries')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('fund-entries')
export class FundEntriesController {
  constructor(private readonly service: FundEntriesService) {}

  @RequirePermissions('treasury.read')
  @Get()
  @ApiOperation({ summary: 'List fund entries (paginated, filtered)' })
  findAll(@Query() query: FundEntriesListQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('treasury.read')
  @Get(':id/attachments')
  @ApiOperation({ summary: 'List attachments for a fund entry' })
  @ApiOkResponse({ type: [FundEntryAttachmentDto] })
  listAttachments(@Param('id') id: string) {
    return this.service.listAttachments(id);
  }

  @RequirePermissions('treasury.read')
  @Get(':id/attachments/:attachmentId/file')
  @ApiOperation({ summary: 'Download fund entry attachment file' })
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

  @RequirePermissions('treasury.entries.write')
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
      storage: diskStorage(fundEntryAttachmentStorage()),
      limits: { fileSize: FUND_ENTRY_ATTACHMENT_MAX_BYTES },
      fileFilter: fundEntryAttachmentFileFilter,
    }),
  )
  @ApiOperation({
    summary: 'Upload fund entry attachment (JPEG, PNG, WebP or PDF, max 10 MB)',
  })
  @ApiOkResponse({ type: FundEntryAttachmentDto })
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

  @RequirePermissions('treasury.entries.write')
  @Delete(':id/attachments/:attachmentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete fund entry attachment' })
  removeAttachment(
    @Param('id') id: string,
    @Param('attachmentId') attachmentId: string,
  ) {
    return this.service.softDeleteAttachment(id, attachmentId);
  }

  @RequirePermissions('treasury.entries.write')
  @Post(':id/bookings')
  @ApiOperation({
    summary: 'Attach booking(s) to a fund entry (additive, 0..N)',
  })
  attachBookings(
    @Param('id') id: string,
    @Body() dto: AttachFundEntryBookingsDto,
  ) {
    return this.service.attachBookings(id, dto.bookingIds);
  }

  @RequirePermissions('treasury.entries.write')
  @Delete(':id/bookings/:bookingId')
  @ApiOperation({ summary: 'Detach a booking from a fund entry' })
  detachBooking(
    @Param('id') id: string,
    @Param('bookingId') bookingId: string,
  ) {
    return this.service.detachBooking(id, bookingId);
  }

  @RequirePermissions('treasury.read')
  @Get(':id')
  @ApiOperation({
    summary: 'Get fund entry by id (with bookingIds + attachments)',
  })
  findOne(@Param('id') id: string) {
    return this.service.findOneDto(id);
  }

  @RequirePermissions('treasury.entries.write')
  @Post()
  @ApiOperation({ summary: 'Create fund entry' })
  create(
    @Body() dto: CreateFundEntryDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.createFromDto(dto, user.id);
  }

  @RequirePermissions('treasury.entries.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update fund entry' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateFundEntryDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.updateFromDto(id, dto, user.id);
  }

  @RequirePermissions('treasury.void')
  @Post(':id/void')
  @ApiOperation({
    summary: 'Void (soft-cancel) a fund entry — requires reason',
  })
  voidEntry(
    @Param('id') id: string,
    @Body() dto: VoidTreasuryOperationDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.voidFromDto(id, dto, user.id);
  }

  @RequirePermissions('treasury.entries.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete fund entry' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
    return this.service.remove(id, user.id);
  }
}
