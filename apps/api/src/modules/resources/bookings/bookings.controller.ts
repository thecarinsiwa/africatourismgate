import {
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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import type { Response } from 'express';
import { ApiForbiddenResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BadRequestException } from '@nestjs/common';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { PermissionsService } from '../../rbac/permissions.service';
import { StripeService } from '../../stripe/stripe.service';
import { BookingEngineService } from './booking-engine.service';
import { BookingsService } from './bookings.service';
import { BookingCheckoutDto } from './dto/booking-checkout.dto';
import { BookingRequestResponseDto } from './dto/booking-request-response.dto';
import { BookingsListQueryDto } from './dto/bookings-list-query.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { RecordCashPaymentDto } from './dto/record-cash-payment.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { CreateBookingReviewDto } from '../reviews/dto/create-booking-review.dto';
import { TourGuidesModule } from '../tour-guides/tour-guides.module';
import { BookingGuideAssignmentsService } from '../tour-guides/booking-guide-assignments.service';
import { AssignBookingGuidesDto } from '../tour-guides/dto/booking-guide-assignment.dto';
import { BookingMessagesService } from './booking-messages.service';
import { BookingMessageDto, BookingMessagesListDto } from './dto/booking-message.dto';
import { BookingMessagesQueryDto } from './dto/booking-messages-query.dto';
import { CreateBookingMessageDto } from './dto/create-booking-message.dto';
import { ApproveBookingDto } from './dto/approve-booking.dto';
import { RejectBookingDto } from './dto/reject-booking.dto';
import { BookingApprovalService } from './booking-approval.service';
import {
  BOOKING_IDENTITY_DOCUMENT_MAX_BYTES,
  BookingIdentityDocumentsService,
  bookingIdentityDocumentFileFilter,
  bookingIdentityDocumentStorage,
} from './booking-identity-documents.service';
import {
  BookingIdentityDocumentDto,
  ReviewBookingIdentityDocumentDto,
} from './dto/booking-identity-document.dto';
import { BookingManifestService } from './booking-manifest.service';
import {
  BookingManifestEntryDto,
  CreateBookingManifestEntryDto,
  UpdateBookingManifestEntryDto,
} from './dto/booking-manifest-entry.dto';

@ApiTags('bookings')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('bookings')
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly bookingEngine: BookingEngineService,
    private readonly stripeService: StripeService,
    private readonly permissionsService: PermissionsService,
    private readonly bookingGuideAssignmentsService: BookingGuideAssignmentsService,
    private readonly bookingMessagesService: BookingMessagesService,
    private readonly bookingApprovalService: BookingApprovalService,
    private readonly bookingIdentityDocumentsService: BookingIdentityDocumentsService,
    private readonly bookingManifestService: BookingManifestService,
  ) {}

  @Post('checkout-preview')
  @RequirePermissions('bookings.write')
  @ApiOperation({ summary: 'Preview booking checkout (stock + pricing)' })
  previewCheckout(
    @Body() dto: BookingCheckoutDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.bookingsService.previewCheckout(dto, user.id);
  }

  @Post('request')
  @RequirePermissions('bookings.write')
  @ApiOperation({
    summary: 'Submit assisted booking request (pending approval, no payment)',
  })
  requestBooking(
    @Body() dto: BookingCheckoutDto,
    @CurrentUser() user: AuthUserDto,
  ): Promise<BookingRequestResponseDto> {
    return this.bookingsService.requestFromCheckout(dto, user.id);
  }

  @Post()
  @RequirePermissions('bookings.write')
  @ApiOperation({ summary: 'Create booking with room stock allocation' })
  createBooking(
    @Body() dto: BookingCheckoutDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.bookingsService.createFromCheckout(dto, user.id);
  }

  @Get()
  @RequirePermissions('bookings.read')
  @ApiOperation({ summary: 'List bookings' })
  findAll(
    @Query() query: BookingsListQueryDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.bookingsService.list(query, user.id);
  }

  @Get(':id/reviews')
  @RequirePermissions('reviews.read')
  @ApiOperation({ summary: 'Get review for a booking' })
  getReview(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
    return this.bookingsService.getBookingReview(id, user.id);
  }

  @Get(':id/guides')
  @RequirePermissions('bookings.read')
  @ApiOperation({ summary: 'List guides assigned to a booking' })
  listGuides(@Param('id') id: string) {
    return this.bookingGuideAssignmentsService.listByBookingId(id);
  }

  @Post(':id/guides')
  @RequirePermissions('bookings.write')
  @ApiOperation({ summary: 'Assign one or more tour guides to a booking' })
  assignGuides(
    @Param('id') id: string,
    @Body() dto: AssignBookingGuidesDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.bookingGuideAssignmentsService.assignGuides(id, dto, user.id);
  }

  @Delete(':id/guides/:guideId')
  @RequirePermissions('bookings.write')
  @ApiOperation({ summary: 'Remove a tour guide assignment from a booking' })
  async removeGuide(
    @Param('id') id: string,
    @Param('guideId') guideId: string,
  ) {
    await this.bookingGuideAssignmentsService.removeGuide(id, guideId);
  }

  @Get(':id/messages')
  @RequirePermissions('bookings.read')
  @ApiOperation({ summary: 'List messages on a booking thread' })
  listMessages(
    @Param('id') id: string,
    @Query() query: BookingMessagesQueryDto,
    @CurrentUser() user: AuthUserDto,
  ): Promise<BookingMessagesListDto> {
    return this.bookingMessagesService.listByBookingId(id, user.id, query.chatToken);
  }

  @Post(':id/messages')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('bookings.write')
  @ApiOperation({ summary: 'Post a message on a booking thread' })
  createMessage(
    @Param('id') id: string,
    @Body() dto: CreateBookingMessageDto,
    @Query() query: BookingMessagesQueryDto,
    @CurrentUser() user: AuthUserDto,
  ): Promise<BookingMessageDto> {
    return this.bookingMessagesService.createMessage(id, dto, user.id, query.chatToken);
  }

  @Post(':id/thread-presence')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('bookings.read')
  @ApiOperation({ summary: 'Customer heartbeat while viewing booking chat thread' })
  async touchThreadPresence(
    @Param('id') id: string,
    @CurrentUser() user: AuthUserDto,
  ): Promise<void> {
    await this.bookingMessagesService.touchThreadPresence(id, user.id);
  }

  @Post(':id/reviews')
  @RequirePermissions('reviews.write')
  @ApiOperation({ summary: 'Submit a post-stay review for a booking' })
  createReview(
    @Param('id') id: string,
    @Body() dto: CreateBookingReviewDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.bookingsService.createBookingReview(id, user.id, dto);
  }

  @Post(':id/guides/:guideId/reviews')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('reviews.write')
  @ApiOperation({ summary: 'Submit a post-stay review for an assigned tour guide' })
  createGuideReview(
    @Param('id') id: string,
    @Param('guideId') guideId: string,
    @Body() dto: CreateBookingReviewDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.bookingsService.createGuideReview(id, guideId, user.id, dto);
  }

  @Get(':id/identity-documents')
  @RequirePermissions('bookings.read')
  @ApiOperation({ summary: 'List identity documents for a booking' })
  async listIdentityDocuments(
    @Param('id') id: string,
    @CurrentUser() user: AuthUserDto,
  ): Promise<BookingIdentityDocumentDto[]> {
    await this.bookingsService.assertBookingOwnerOrStaff(id, user.id);
    return this.bookingIdentityDocumentsService.listForBooking(id);
  }

  @Get(':id/identity-documents/:documentId/file')
  @RequirePermissions('bookings.read')
  @ApiOperation({ summary: 'Download an identity document (authenticated)' })
  async downloadIdentityDocument(
    @Param('id') id: string,
    @Param('documentId') documentId: string,
    @CurrentUser() user: AuthUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.bookingsService.assertBookingOwnerOrStaff(id, user.id);
    const { stream, mimeType, filename } =
      await this.bookingIdentityDocumentsService.getFileStream(id, documentId);
    res.setHeader('Content-Type', mimeType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(filename)}"`,
    );
    return stream;
  }

  @Post(':id/identity-documents')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('bookings.write')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage(bookingIdentityDocumentStorage()),
      limits: { fileSize: BOOKING_IDENTITY_DOCUMENT_MAX_BYTES },
      fileFilter: bookingIdentityDocumentFileFilter,
    }),
  )
  @ApiOperation({
    summary: 'Upload an identity document (JPEG, PNG, WebP or PDF, max 10 MB)',
  })
  async uploadIdentityDocument(
    @Param('id') id: string,
    @Body('documentType') documentTypeRaw: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() user: AuthUserDto,
  ): Promise<BookingIdentityDocumentDto> {
    const booking = await this.bookingsService.assertBookingOwnerOrStaff(id, user.id);
    if (!file) {
      throw new BadRequestException(
        'Fichier requis (JPEG, PNG, WebP ou PDF, max 10 Mo).',
      );
    }
    const documentType =
      BookingIdentityDocumentsService.parseDocumentType(documentTypeRaw);
    return this.bookingIdentityDocumentsService.upload(
      booking,
      user.id,
      documentType,
      file,
    );
  }

  @Post(':id/identity-documents/:documentId/approve')
  @RequirePermissions('bookings.approve', 'bookings.write')
  @ApiOperation({ summary: 'Approve an identity document (staff)' })
  approveIdentityDocument(
    @Param('id') id: string,
    @Param('documentId') documentId: string,
    @Body() dto: ReviewBookingIdentityDocumentDto,
    @CurrentUser() user: AuthUserDto,
  ): Promise<BookingIdentityDocumentDto> {
    return this.bookingIdentityDocumentsService.approve(
      id,
      documentId,
      user.id,
      dto.staffNote,
    );
  }

  @Post(':id/identity-documents/:documentId/request-resubmit')
  @RequirePermissions('bookings.approve', 'bookings.write')
  @ApiOperation({ summary: 'Request a clearer identity document (staff)' })
  requestIdentityDocumentResubmit(
    @Param('id') id: string,
    @Param('documentId') documentId: string,
    @Body() dto: ReviewBookingIdentityDocumentDto,
    @CurrentUser() user: AuthUserDto,
  ): Promise<BookingIdentityDocumentDto> {
    return this.bookingIdentityDocumentsService.requestResubmit(
      id,
      documentId,
      user.id,
      dto.staffNote,
    );
  }

  @Post(':id/identity-documents/:documentId/reject')
  @RequirePermissions('bookings.approve', 'bookings.write')
  @ApiOperation({ summary: 'Reject an identity document (staff)' })
  rejectIdentityDocument(
    @Param('id') id: string,
    @Param('documentId') documentId: string,
    @Body() dto: ReviewBookingIdentityDocumentDto,
    @CurrentUser() user: AuthUserDto,
  ): Promise<BookingIdentityDocumentDto> {
    return this.bookingIdentityDocumentsService.reject(
      id,
      documentId,
      user.id,
      dto.staffNote,
    );
  }

  @Get(':id/manifest-entries')
  @RequirePermissions('bookings.read')
  @ApiOperation({ summary: 'List manifest entries for a booking' })
  listManifestEntries(
    @Param('id') id: string,
  ): Promise<BookingManifestEntryDto[]> {
    return this.bookingManifestService.listForBooking(id);
  }

  @Post(':id/manifest-entries')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('bookings.write')
  @ApiOperation({ summary: 'Add a manifest entry to a booking' })
  createManifestEntry(
    @Param('id') id: string,
    @Body() dto: CreateBookingManifestEntryDto,
    @CurrentUser() user: AuthUserDto,
  ): Promise<BookingManifestEntryDto> {
    return this.bookingManifestService.create(id, dto, user.id);
  }

  @Patch(':id/manifest-entries/:entryId')
  @RequirePermissions('bookings.write')
  @ApiOperation({ summary: 'Update a manifest entry' })
  updateManifestEntry(
    @Param('id') id: string,
    @Param('entryId') entryId: string,
    @Body() dto: UpdateBookingManifestEntryDto,
    @CurrentUser() user: AuthUserDto,
  ): Promise<BookingManifestEntryDto> {
    return this.bookingManifestService.update(id, entryId, dto, user.id);
  }

  @Delete(':id/manifest-entries/:entryId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('bookings.write')
  @ApiOperation({ summary: 'Remove a manifest entry' })
  async removeManifestEntry(
    @Param('id') id: string,
    @Param('entryId') entryId: string,
    @CurrentUser() user: AuthUserDto,
  ): Promise<void> {
    await this.bookingManifestService.remove(id, entryId, user.id);
  }

  @Get(':id')
  @RequirePermissions('bookings.read')
  @ApiOperation({ summary: 'Get booking detail with client, items, payments, status history' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthUserDto,
  ) {
    const staff = await this.permissionsService.hasAnyPermission(user.id, [
      'users.read',
    ]);
    if (staff) {
      return this.bookingsService.getAdminDetail(id);
    }
    return this.bookingsService.getCustomerDetail(id, user.id);
  }

  @Patch(':id/status')
  @RequirePermissions('bookings.write')
  @ApiOperation({ summary: 'Change booking status (records history)' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateBookingStatusDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.bookingsService.updateStatus(id, dto, user.id);
  }

  @Post(':id/cash-payment')
  @RequirePermissions('bookings.write')
  @ApiOperation({ summary: 'Record cash payment and confirm booking (POS)' })
  async recordCashPayment(
    @Param('id') id: string,
    @Body() dto: RecordCashPaymentDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    await this.bookingsService.assertBookingOwnerOrStaff(id, user.id);
    return this.bookingEngine.recordCashPayment(id, user.id, dto.note);
  }

  @Post(':id/payment-intent')
  @RequirePermissions('bookings.write')
  @ApiOperation({ summary: 'Create Stripe PaymentIntent for booking (test / custom UI)' })
  async createPaymentIntent(
    @Param('id') id: string,
    @CurrentUser() user: AuthUserDto,
  ) {
    await this.bookingsService.assertBookingOwnerOrStaff(id, user.id);
    return this.stripeService.createPaymentIntentForBooking(id, user.id);
  }

  @Post(':id/checkout-session')
  @RequirePermissions('bookings.write')
  @ApiOperation({ summary: 'Create Stripe Checkout Session (hosted payment page)' })
  async createCheckoutSession(
    @Param('id') id: string,
    @CurrentUser() user: AuthUserDto,
  ) {
    await this.bookingsService.assertBookingOwnerOrStaff(id, user.id);
    return this.stripeService.createCheckoutSessionForBooking(id, user.id);
  }

  @Post(':id/confirm')
  @RequirePermissions('bookings.write')
  @ApiOperation({ summary: 'Confirm booking (pending_payment → confirmed)' })
  async confirm(
    @Param('id') id: string,
    @CurrentUser() user: AuthUserDto,
  ) {
    await this.bookingsService.assertBookingOwnerOrStaff(id, user.id);
    return this.bookingEngine.confirmBooking(id, user.id);
  }

  @Post(':id/cancel')
  @RequirePermissions('bookings.write')
  @ApiOperation({ summary: 'Cancel booking, restore stock, optional reason' })
  cancel(
    @Param('id') id: string,
    @Body() dto: CancelBookingDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.bookingsService.cancelWithReason(id, dto.reason, user.id);
  }

  @Post(':id/approve')
  @RequirePermissions('bookings.approve', 'bookings.write')
  @ApiOperation({
    summary: 'Approve assisted booking (pending_approval → pending_payment)',
  })
  approve(
    @Param('id') id: string,
    @Body() dto: ApproveBookingDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.bookingApprovalService.approve(id, dto, user.id);
  }

  @Post(':id/reject')
  @RequirePermissions('bookings.approve', 'bookings.write')
  @ApiOperation({ summary: 'Reject assisted booking (pending_approval → cancelled)' })
  reject(
    @Param('id') id: string,
    @Body() dto: RejectBookingDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.bookingApprovalService.reject(id, dto, user.id);
  }

  @Post(':id/invite-payment')
  @RequirePermissions('bookings.approve', 'bookings.write')
  @ApiOperation({
    summary: 'Generate or return Stripe Checkout link for pending_payment booking',
  })
  invitePayment(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
    return this.bookingApprovalService.invitePayment(id, user.id);
  }
}
