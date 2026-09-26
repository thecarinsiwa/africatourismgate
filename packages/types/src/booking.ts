import type { GuideReviewInvite, Review } from './review.js';
import type { BookingMode } from './tour-guide.js';

export type BookingStatus =
  | 'draft'
  | 'pending_approval'
  | 'pending_payment'
  | 'confirmed'
  | 'cancelled'
  | 'refunded';

/** Chosen at checkout; null on legacy bookings. */
export type BookingPreferredPaymentMethod =
  | 'stripe'
  | 'cash'
  | 'bank_transfer'
  | 'mobile_money';

export type BookingCheckoutItemType =
  | 'room'
  | 'flight_class'
  | 'vehicle'
  | 'cabin'
  | 'activity_schedule'
  | 'package';

export type BookingItemType =
  | BookingCheckoutItemType
  | 'package';

export interface Booking {
  id: string;
  userId: string;
  status: BookingStatus;
  totalCents: number;
  currency: string;
  promoCodeId: string | null;
  promotionId?: string | null;
  /** Stripe Checkout vs cash on site vs bank transfer; null for bookings before this field. */
  preferredPaymentMethod?: BookingPreferredPaymentMethod | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface BookingCheckoutItem {
  itemType: BookingCheckoutItemType;
  referenceId: string;
  quantity: number;
  startDate?: string;
  endDate?: string;
  date?: string;
}

export interface BookingCheckoutRequest {
  items: BookingCheckoutItem[];
  currency?: string;
  promoCode?: string;
  promotionId?: string;
  /** Active package bundle — server validates items and applies package discount. */
  packageId?: string;
  /** Staff only (e.g. POS): booking is owned by this user instead of the actor. */
  customerUserId?: string;
  /** Required on create/request; optional on checkout-preview. */
  preferredPaymentMethod?: BookingPreferredPaymentMethod;
  /**
   * POS / staff: scope catalogue.
   * Each product must be shared (organizationId null) or match this org.
   */
  organizationId?: string;
}

export interface AppliedPackageCheckoutDiscount {
  packageId: string;
  name: string;
  discountPercent: number;
  discountCents: number;
}

export interface AppliedCheckoutDiscount {
  kind: 'promo_code' | 'promotion';
  id: string;
  label: string;
  discountType: 'percent' | 'fixed_amount';
  discountValue: number;
  discountCents: number;
}

export interface BookingCheckoutLine {
  itemType: BookingCheckoutItemType;
  referenceId: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
  titleSnapshot: string;
  currency: string;
  startDate: string | null;
  endDate: string | null;
}

export interface BookingCheckoutPreview {
  lines: BookingCheckoutLine[];
  subtotalCents: number;
  packageDiscountCents: number;
  discountCents: number;
  totalCents: number;
  currency: string;
  appliedPackageDiscount: AppliedPackageCheckoutDiscount | null;
  appliedDiscount: AppliedCheckoutDiscount | null;
  bookingMode: BookingMode;
}

export interface BookingItem {
  id: string;
  bookingId: string;
  itemType: string;
  referenceId: string;
  titleSnapshot: string;
  quantity: number;
  unitPriceCents: number;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface BookingRequestResponse {
  bookingId: string;
  status: 'pending_approval';
  message: string;
  totalCents: number;
  currency: string;
}

export interface BookingMessage {
  id: string;
  bookingId: string;
  userId: string | null;
  body: string;
  isStaff: boolean;
  /** Full name of the customer who posted the message (non-staff only). */
  authorName?: string | null;
  /** Avatar URL of the message author (customer or staff). */
  avatarUrl?: string | null;
  createdAt: string;
  /** Present on staff POST responses when the customer was offline. */
  customerNotifiedByEmail?: boolean;
}

export interface BookingMessagesList {
  messages: BookingMessage[];
}

export interface CreateBookingMessageRequest {
  body: string;
}

export type BookingIdentityDocumentType =
  | 'passport'
  | 'national_id'
  | 'drivers_license'
  | 'other';

export type BookingIdentityDocumentStatus =
  | 'pending_review'
  | 'approved'
  | 'resubmit_requested'
  | 'rejected';

export interface BookingIdentityDocument {
  id: string;
  bookingId: string;
  /** Null for legacy uploads before PR-11. */
  manifestEntryId: string | null;
  userId: string;
  documentType: BookingIdentityDocumentType;
  originalFilename: string;
  mimeType: string;
  fileSizeBytes: number;
  status: BookingIdentityDocumentStatus;
  staffNote?: string | null;
  reviewedByUserId?: string | null;
  reviewedAt?: string | null;
  version: number;
  createdAt: string;
}

export interface ReviewBookingIdentityDocumentRequest {
  staffNote?: string;
}

export interface RequestIdentityDocumentUploadRequest {
  travelerName: string;
  staffNote?: string;
  travelerIndex?: number;
}

export interface RequestIdentityDocumentUploadResponse {
  sent: boolean;
}

export type BookingPaymentProofMethod = 'bank_transfer' | 'mobile_money';

export type BookingPaymentProofStatus =
  | 'pending_review'
  | 'approved'
  | 'resubmit_requested'
  | 'rejected';

export interface BookingPaymentProof {
  id: string;
  bookingId: string;
  paymentId: string | null;
  userId: string;
  paymentMethod: BookingPaymentProofMethod;
  /** Montant du paiement lié (centimes), si connu. */
  amountCents?: number | null;
  originalFilename: string;
  mimeType: string;
  fileSizeBytes: number;
  status: BookingPaymentProofStatus;
  staffNote?: string | null;
  reviewedByUserId?: string | null;
  reviewedAt?: string | null;
  version: number;
  createdAt: string;
}

export interface ReviewBookingPaymentProofRequest {
  staffNote?: string;
  /** Montant validé en centimes (défaut = montant du paiement lié / acompte ou solde). */
  amountCents?: number;
}

export type BookingManifestSex = 'M' | 'F' | 'other';

/** Single emergency contact for a booking (not per traveler). */
export interface BookingEmergencyContact {
  name: string | null;
  phone: string | null;
  email: string | null;
  country: string | null;
  address: string | null;
}

export interface UpdateBookingEmergencyContactRequest {
  name: string;
  phone: string;
  email?: string | null;
  country?: string | null;
  address?: string | null;
}

export interface BookingManifestEntry {
  id: string;
  bookingId: string;
  sortOrder: number;
  priceCents?: number | null;
  fullName: string;
  age?: number | null;
  sex?: BookingManifestSex | null;
  nationality?: string | null;
  idNumber?: string | null;
  /** @deprecated Prefer booking-level `BookingDetail.emergencyContact`. */
  emergencyContactName?: string | null;
  /** @deprecated Prefer booking-level `BookingDetail.emergencyContact`. */
  emergencyContactPhone?: string | null;
  /** @deprecated Prefer booking-level `BookingDetail.emergencyContact`. */
  emergencyContactEmail?: string | null;
  /** @deprecated Prefer booking-level `BookingDetail.emergencyContact`. */
  emergencyContactCountry?: string | null;
  /** @deprecated Prefer booking-level `BookingDetail.emergencyContact`. */
  emergencyContactAddress?: string | null;
  /** Legacy free-text medical notes — read-only; prefer structured fields. */
  conditions?: string | null;
  allergies?: string | null;
  seriousMedicalConditions?: string | null;
  currentMedications?: string | null;
  dietaryNotes?: string | null;
  comment?: string | null;
  other?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateBookingManifestEntryRequest {
  fullName: string;
  /** Required on create (checkout / admin / POS). */
  nationality: string;
  /** Required on create — passport or national ID number. */
  idNumber: string;
  /**
   * @deprecated Ignored for new writes — use booking-level emergency contact.
   * Kept optional for backward-compatible clients.
   */
  emergencyContactName?: string;
  /**
   * @deprecated Ignored for new writes — use booking-level emergency contact.
   * Kept optional for backward-compatible clients.
   */
  emergencyContactPhone?: string;
  priceCents?: number;
  age?: number;
  sex?: BookingManifestSex;
  /** @deprecated Ignored for new writes — use booking-level emergency contact. */
  emergencyContactEmail?: string;
  /** @deprecated Ignored for new writes — use booking-level emergency contact. */
  emergencyContactCountry?: string;
  /** @deprecated Ignored for new writes — use booking-level emergency contact. */
  emergencyContactAddress?: string;
  /** @deprecated Ignored for persistence; use structured medical fields or `other`. */
  conditions?: string;
  allergies?: string;
  seriousMedicalConditions?: string;
  currentMedications?: string;
  dietaryNotes?: string;
  comment?: string;
  other?: string;
  sortOrder?: number;
}

/** Partial update — omit fields that should stay unchanged. */
export type UpdateBookingManifestEntryRequest = Partial<CreateBookingManifestEntryRequest>;

export interface BookingDetail {
  booking: Booking;
  items: BookingItem[];
  totalCents: number;
  currency: string;
  /** Somme des paiements `succeeded` (centimes). */
  paidCents: number;
  /** max(0, totalCents - paidCents). */
  balanceCents: number;
  /** Montant du premier encaissement attendu (acompte ou total). */
  depositRequiredCents: number;
  /** Single emergency contact for the whole reservation. */
  emergencyContact?: BookingEmergencyContact | null;
  review?: Review | null;
  canReview?: boolean;
  statusHistory?: BookingStatusHistoryEntry[];
  /** True when staff sent a Stripe checkout invite (pending stripe payment exists). */
  paymentInvited?: boolean;
  /** Post-stay guide rating invitations (CE-13). */
  guideReviewInvites?: GuideReviewInvite[];
  identityDocuments?: BookingIdentityDocument[];
  paymentProofs?: BookingPaymentProof[];
  /** Unread staff messages for the booking owner (assisted booking chat). */
  unreadStaffMessageCount?: number;
}

export interface CreateBookingResponse extends BookingDetail {
  requiresVerification?: boolean;
  verificationId?: string;
}

export interface BookingClient {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string | null;
  organizationName: string | null;
}

export interface BookingPayment {
  id: string;
  bookingId: string;
  amountCents: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  provider: string | null;
  externalId: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface BookingStatusHistoryEntry {
  id: string;
  bookingId: string;
  fromStatus: BookingStatus | null;
  toStatus: BookingStatus;
  reason: string | null;
  changedByUserId: string | null;
  createdAt: string;
}

export interface BookingAdminDetail extends BookingDetail {
  client: BookingClient;
  payments: BookingPayment[];
  statusHistory: BookingStatusHistoryEntry[];
  unreadCustomerMessageCount?: number;
}

export interface UpdateBookingStatusRequest {
  status: BookingStatus;
  reason?: string;
}

export interface CancelBookingRequest {
  reason?: string;
}

export interface RecordCashPaymentRequest {
  /** Montant en centimes ; défaut = acompte (1er paiement) ou solde restant. */
  amountCents?: number;
  note?: string;
}

export interface RecordBankTransferPaymentRequest {
  /** Montant en centimes ; défaut = acompte (1er paiement) ou solde restant. */
  amountCents?: number;
  note?: string;
}

export interface PublicPaymentBankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  swiftBic: string | null;
  currency: string;
  isDefault: boolean;
}

export interface SendBookingReceiptEmailRequest {
  to: string;
}

export interface SendBookingReceiptEmailResponse {
  sent: boolean;
  messageId?: string;
  previewUrl?: string;
}

export interface RejectBookingRequest {
  reason?: string;
}

export interface ApproveTravelerPricingRequest {
  id?: string;
  fullName: string;
  age?: number;
  sex?: BookingManifestSex;
  priceCents: number;
}

export interface ApproveBookingRequest {
  totalCents?: number;
  reason?: string;
  travelers?: ApproveTravelerPricingRequest[];
  guides?: Array<{ guideId: string; role?: 'primary' | 'secondary' }>;
  visitStartDate?: string;
  visitEndDate?: string;
}

export interface UpdateBookingVisitDatesRequest {
  startDate: string;
  endDate?: string;
}

export interface UpdateBookingPricingRequest {
  travelers: Array<{
    id?: string;
    fullName: string;
    age?: number;
    sex?: BookingManifestSex;
    priceCents: number;
  }>;
  totalCents?: number;
}

export interface BookingPaymentIntentResponse {
  paymentId: string;
  paymentIntentId: string;
  clientSecret: string;
  amountCents: number;
  currency: string;
}

export interface BookingCheckoutSessionResponse {
  paymentId: string;
  sessionId: string;
  url: string;
  amountCents: number;
  currency: string;
}

export interface RefundPaymentResponse {
  refundId: string;
  amountCents: number;
  stripeStatus: string;
  paymentId: string;
  bookingId: string;
  paymentStatus: BookingPayment['status'];
  bookingStatus: BookingStatus;
}

export interface BookingListItem extends Booking {
  clientEmail: string;
  clientFirstName: string;
  clientLastName: string;
  organizationId: string | null;
  /** Customer account list: payment invite or unread staff message. */
  actionRequired?: boolean;
  /** Customer account list: post-stay review can be submitted. */
  canReview?: boolean;
  /** Admin list: unread customer message on the booking thread. */
  unreadCustomerMessage?: boolean;
}

export interface BookingsListQuery {
  page?: number;
  limit?: number;
  status?: BookingStatus;
  userId?: string;
  /** Staff only: bookings created by this user (e.g. POS cashier). */
  createdByUserId?: string;
  organizationId?: string;
  dateFrom?: string;
  dateTo?: string;
  /** Tri par date de création (`createdAt`). */
  sortOrder?: 'asc' | 'desc';
  /** Recherche client (email, nom) ou préfixe d’identifiant booking. */
  search?: string;
}

export interface BookingItemListItem {
  id: string;
  bookingId: string;
  itemType: BookingItemType;
  referenceId: string;
  titleSnapshot: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
  startDate: string | null;
  endDate: string | null;
  bookingStatus: BookingStatus;
  currency: string;
  createdAt: string;
}

export interface BookingItemsListQuery {
  page?: number;
  limit?: number;
  itemType?: BookingItemType;
  status?: BookingStatus;
  bookingId?: string;
}
