import { Entity, Column, PrimaryColumn } from 'typeorm';
import { BaseAuditEntity } from '../../common/entities/base-audit.entity';
@Entity('users')
export class Users extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'email', length: 255 })
  email!: string;

  @Column({ type: 'varchar', name: 'password_hash', length: 255, select: false })
  passwordHash!: string;

  @Column({ type: 'varchar', name: 'first_name', length: 100 })
  firstName!: string;

  @Column({ type: 'varchar', name: 'last_name', length: 100 })
  lastName!: string;

  @Column({ type: 'varchar', name: 'phone', length: 32, nullable: true })
  phone!: string;

  @Column({ name: 'gender', enum: ["M","F","other"], nullable: true })
  gender!: 'M' | 'F' | 'other';

  @Column({ type: 'date', name: 'date_of_birth', nullable: true })
  dateOfBirth!: string;

  @Column({ type: 'varchar', name: 'avatar_url', length: 512, nullable: true })
  avatarUrl!: string;

  @Column({ type: 'varchar', name: 'preferred_language', length: 2, nullable: true })
  preferredLanguage!: string;

  @Column({ type: 'datetime', name: 'last_login_at', nullable: true })
  lastLoginAt!: Date;

  @Column({ type: 'varchar', name: 'organization_id', length: 36, nullable: true })
  organizationId!: string;

  @Column({ name: 'status', enum: ["active","suspended","deleted"] })
  status!: 'active' | 'suspended' | 'deleted';

}

@Entity('employees')
export class Employees extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'user_id', length: 36 })
  userId!: string;

  @Column({ type: 'varchar', name: 'organization_id', length: 36, nullable: true })
  organizationId!: string;

  @Column({ type: 'varchar', name: 'employee_code', length: 50, nullable: true })
  employeeCode!: string;

  @Column({ type: 'varchar', name: 'job_title', length: 100, nullable: true })
  jobTitle!: string;

  @Column({ type: 'varchar', name: 'department', length: 100, nullable: true })
  department!: string;

  @Column({ type: 'date', name: 'hire_date', nullable: true })
  hireDate!: string;

  @Column({ type: 'date', name: 'termination_date', nullable: true })
  terminationDate!: string;

  @Column({ type: 'decimal', name: 'salary', precision: 15, scale: 2, nullable: true })
  salary!: string;

  @Column({ type: 'varchar', name: 'currency', length: 3, nullable: true })
  currency!: string;

  @Column({ type: 'varchar', name: 'manager_id', length: 36, nullable: true })
  managerId!: string;

  @Column({ name: 'status', enum: ["active","on_leave","terminated"] })
  status!: 'active' | 'on_leave' | 'terminated';

}

@Entity('user_sessions')
export class UserSessions extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'user_id', length: 36 })
  userId!: string;

  @Column({ type: 'varchar', name: 'refresh_token_hash', length: 255 })
  refreshTokenHash!: string;

  @Column({ type: 'datetime', name: 'expires_at' })
  expiresAt!: Date;

}

@Entity('user_addresses')
export class UserAddresses extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'user_id', length: 36 })
  userId!: string;

  @Column({ type: 'varchar', name: 'label', length: 80, nullable: true })
  label!: string;

  @Column({ type: 'varchar', name: 'line1', length: 255 })
  line1!: string;

  @Column({ type: 'varchar', name: 'line2', length: 255, nullable: true })
  line2!: string;

  @Column({ type: 'varchar', name: 'city', length: 120 })
  city!: string;

  @Column({ type: 'varchar', name: 'region', length: 120, nullable: true })
  region!: string;

  @Column({ type: 'varchar', name: 'postal_code', length: 32, nullable: true })
  postalCode!: string;

  @Column({ type: 'varchar', name: 'country_code', length: 2 })
  countryCode!: string;

  @Column({ type: 'int', name: 'is_default' })
  isDefault!: number;

}

@Entity('user_payment_methods')
export class UserPaymentMethods extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'user_id', length: 36 })
  userId!: string;

  @Column({ name: 'type', enum: ["card","paypal","other"] })
  type!: 'card' | 'paypal' | 'other';

  @Column({ type: 'varchar', name: 'provider', length: 64, nullable: true })
  provider!: string;

  @Column({ type: 'varchar', name: 'last_four', length: 4, nullable: true })
  lastFour!: string;

  @Column({ type: 'varchar', name: 'external_token', length: 255, nullable: true })
  externalToken!: string;

  @Column({ type: 'int', name: 'is_default' })
  isDefault!: number;

}

@Entity('loyalty_accounts')
export class LoyaltyAccounts extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'user_id', length: 36 })
  userId!: string;

  @Column({ type: 'varchar', name: 'program_code', length: 32 })
  programCode!: string;

  @Column({ type: 'int', name: 'points_balance' })
  pointsBalance!: number;

  @Column({ name: 'tier', enum: ["member","silver","gold","platinum"] })
  tier!: 'member' | 'silver' | 'gold' | 'platinum';

}