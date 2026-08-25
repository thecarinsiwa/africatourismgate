import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';
import { BaseAuditEntity } from '../../common/entities/base-audit.entity';
@Entity('email_operation_verifications')
export class EmailOperationVerifications {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'email', length: 255 })
  email!: string;

  @Column({ name: 'purpose', enum: ["register","google_signup","login","booking"] })
  purpose!: 'register' | 'google_signup' | 'login' | 'booking';

  @Column({ type: 'varchar', name: 'reference_id', length: 36 })
  referenceId!: string;

  @Column({ type: 'varchar', name: 'code_hash', length: 64 })
  codeHash!: string;

  @Column({ type: 'datetime', name: 'expires_at' })
  expiresAt!: Date;

  @Column({ type: 'datetime', name: 'verified_at', nullable: true })
  verifiedAt!: Date | null;

  @Column({ type: 'datetime', name: 'abandonment_reminder_sent_at', nullable: true })
  abandonmentReminderSentAt!: Date | null;

  @Column({ type: 'json', name: 'metadata', nullable: true })
  metadata!: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

}

@Entity('room_images')
export class RoomImages extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'room_id', length: 36 })
  roomId!: string;

  @Column({ type: 'varchar', name: 'url', length: 512 })
  url!: string;

  @Column({ type: 'varchar', name: 'caption', length: 255, nullable: true })
  caption!: string | null;

  @Column({ type: 'int', name: 'sort_order' })
  sortOrder!: number;

}

@Entity('flight_images')
export class FlightImages extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'flight_id', length: 36 })
  flightId!: string;

  @Column({ type: 'varchar', name: 'url', length: 512 })
  url!: string;

  @Column({ type: 'varchar', name: 'caption', length: 255, nullable: true })
  caption!: string | null;

  @Column({ type: 'int', name: 'sort_order' })
  sortOrder!: number;

}

@Entity('vehicle_images')
export class VehicleImages extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'vehicle_id', length: 36 })
  vehicleId!: string;

  @Column({ type: 'varchar', name: 'url', length: 512 })
  url!: string;

  @Column({ type: 'varchar', name: 'caption', length: 255, nullable: true })
  caption!: string | null;

  @Column({ type: 'int', name: 'sort_order' })
  sortOrder!: number;

}

@Entity('ship_images')
export class ShipImages extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'ship_id', length: 36 })
  shipId!: string;

  @Column({ type: 'varchar', name: 'url', length: 512 })
  url!: string;

  @Column({ type: 'varchar', name: 'caption', length: 255, nullable: true })
  caption!: string | null;

  @Column({ type: 'int', name: 'sort_order' })
  sortOrder!: number;

}

@Entity('activity_images')
export class ActivityImages extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'activity_id', length: 36 })
  activityId!: string;

  @Column({ type: 'varchar', name: 'url', length: 512 })
  url!: string;

  @Column({ type: 'varchar', name: 'caption', length: 255, nullable: true })
  caption!: string | null;

  @Column({ type: 'int', name: 'sort_order' })
  sortOrder!: number;

}

@Entity('activity_itinerary_stops')
export class ActivityItineraryStops extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'activity_id', length: 36 })
  activityId!: string;

  @Column({ type: 'int', name: 'stop_order' })
  stopOrder!: number;

  @Column({ type: 'varchar', name: 'name', length: 180 })
  name!: string;

  @Column({ type: 'decimal', name: 'latitude', precision: 10, scale: 7 })
  latitude!: string;

  @Column({ type: 'decimal', name: 'longitude', precision: 10, scale: 7 })
  longitude!: string;

  @Column({ type: 'text', name: 'description', nullable: true })
  description!: string | null;

  @Column({ type: 'int', name: 'duration_minutes', nullable: true })
  durationMinutes!: number | null;

}

@Entity('package_images')
export class PackageImages extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'package_id', length: 36 })
  packageId!: string;

  @Column({ type: 'varchar', name: 'url', length: 512 })
  url!: string;

  @Column({ type: 'varchar', name: 'caption', length: 255, nullable: true })
  caption!: string | null;

  @Column({ type: 'int', name: 'sort_order' })
  sortOrder!: number;

  @Column({ type: 'varchar', name: 'source_package_item_id', length: 36, nullable: true })
  sourcePackageItemId!: string | null;

}

@Entity('tour_guides')
export class TourGuides extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ name: 'type', enum: ["internal","external"] })
  type!: 'internal' | 'external';

  @Column({ type: 'varchar', name: 'user_id', length: 36, nullable: true })
  userId!: string | null;

  @Column({ type: 'varchar', name: 'organization_id', length: 36, nullable: true })
  organizationId!: string | null;

  @Column({ type: 'varchar', name: 'display_name', length: 180 })
  displayName!: string;

  @Column({ type: 'text', name: 'bio', nullable: true })
  bio!: string | null;

  @Column({ type: 'varchar', name: 'photo_url', length: 512, nullable: true })
  photoUrl!: string | null;

  @Column({ type: 'varchar', name: 'contact_email', length: 255, nullable: true })
  contactEmail!: string | null;

  @Column({ type: 'json', name: 'languages' })
  languages!: string[];

  @Column({ type: 'json', name: 'destinations' })
  destinations!: string[];

  @Column({ name: 'status', enum: ["active","inactive"] })
  status!: 'active' | 'inactive';

}

@Entity('booking_guide_assignments')
export class BookingGuideAssignments {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'booking_id', length: 36 })
  bookingId!: string;

  @Column({ type: 'varchar', name: 'guide_id', length: 36 })
  guideId!: string;

  @Column({ name: 'role', enum: ["primary","secondary"] })
  role!: 'primary' | 'secondary';

  @Column({ type: 'datetime', name: 'start_datetime' })
  startDatetime!: Date;

  @Column({ type: 'datetime', name: 'end_datetime' })
  endDatetime!: Date;

  @Column({ type: 'varchar', name: 'notes', length: 500, nullable: true })
  notes!: string | null;

  @Column({ type: 'datetime', name: 'assigned_at' })
  assignedAt!: Date;

  @Column({ type: 'varchar', name: 'assigned_by_user_id', length: 36, nullable: true })
  assignedByUserId!: string | null;

}

@Entity('guide_availability')
export class GuideAvailability extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'guide_id', length: 36 })
  guideId!: string;

  @Column({ type: 'datetime', name: 'start_datetime' })
  startDatetime!: Date;

  @Column({ type: 'datetime', name: 'end_datetime' })
  endDatetime!: Date;

  @Column({ name: 'status', enum: ["available","unavailable"] })
  status!: 'available' | 'unavailable';

}

@Entity('booking_guide_assignment_history')
export class BookingGuideAssignmentHistory {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'assignment_id', length: 36 })
  assignmentId!: string;

  @Column({ type: 'varchar', name: 'booking_id', length: 36 })
  bookingId!: string;

  @Column({ type: 'varchar', name: 'guide_id', length: 36 })
  guideId!: string;

  @Column({ name: 'action', enum: ["created","updated","deleted"] })
  action!: 'created' | 'updated' | 'deleted';

  @Column({ type: 'json', name: 'snapshot' })
  snapshot!: Record<string, unknown>;

  @Column({ type: 'varchar', name: 'actor_user_id', length: 36, nullable: true })
  actorUserId!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

}

@Entity('booking_messages')
export class BookingMessages extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'booking_id', length: 36 })
  bookingId!: string;

  @Column({ type: 'varchar', name: 'user_id', length: 36, nullable: true })
  userId!: string | null;

  @Column({ type: 'text', name: 'body' })
  body!: string;

  @Column({ type: 'int', name: 'is_staff' })
  isStaff!: number;

}