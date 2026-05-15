import { Entity, Column, PrimaryColumn } from 'typeorm';
import { BaseAuditEntity } from '../../common/entities/base-audit.entity';
@Entity('organizations')
export class Organizations extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'name', length: 255 })
  name!: string;

  @Column({ type: 'varchar', name: 'slug', length: 255 })
  slug!: string;

  @Column({ type: 'text', name: 'description', nullable: true })
  description!: string;

  @Column({ type: 'varchar', name: 'website', length: 255, nullable: true })
  website!: string;

  @Column({ type: 'varchar', name: 'contact_email', length: 255, nullable: true })
  contactEmail!: string;

  @Column({ type: 'varchar', name: 'contact_phone', length: 32, nullable: true })
  contactPhone!: string;

  @Column({ type: 'varchar', name: 'logo_url', length: 512, nullable: true })
  logoUrl!: string;

  @Column({ type: 'varchar', name: 'favicon_url', length: 512, nullable: true })
  faviconUrl!: string;

  @Column({ type: 'varchar', name: 'legal_form', length: 50, nullable: true })
  legalForm!: string;

  @Column({ type: 'varchar', name: 'rccm', length: 100, nullable: true })
  rccm!: string;

  @Column({ type: 'varchar', name: 'id_nat', length: 100, nullable: true })
  idNat!: string;

  @Column({ type: 'varchar', name: 'nif', length: 100, nullable: true })
  nif!: string;

  @Column({ type: 'varchar', name: 'cnss', length: 100, nullable: true })
  cnss!: string;

  @Column({ type: 'varchar', name: 'currency', length: 3 })
  currency!: string;

  @Column({ name: 'status', enum: ["active","suspended","deleted"] })
  status!: 'active' | 'suspended' | 'deleted';

}

@Entity('organization_settings')
export class OrganizationSettings extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'organization_id', length: 36 })
  organizationId!: string;

  @Column({ type: 'varchar', name: 'setting_group', length: 50 })
  settingGroup!: string;

  @Column({ type: 'varchar', name: 'setting_key', length: 100 })
  settingKey!: string;

  @Column({ type: 'json', name: 'setting_value' })
  settingValue!: Record<string, unknown>;

}

@Entity('organization_bank_accounts')
export class OrganizationBankAccounts extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'organization_id', length: 36 })
  organizationId!: string;

  @Column({ type: 'varchar', name: 'bank_name', length: 150 })
  bankName!: string;

  @Column({ type: 'varchar', name: 'account_name', length: 150 })
  accountName!: string;

  @Column({ type: 'varchar', name: 'account_number', length: 100 })
  accountNumber!: string;

  @Column({ type: 'varchar', name: 'swift_bic', length: 32, nullable: true })
  swiftBic!: string;

  @Column({ type: 'varchar', name: 'currency', length: 3 })
  currency!: string;

  @Column({ type: 'int', name: 'is_default' })
  isDefault!: number;

}