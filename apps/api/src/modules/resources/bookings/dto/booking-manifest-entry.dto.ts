import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import type { BookingManifestSex } from '../../../../entities/booking-manifest-entry.entity';

export class BookingManifestEntryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  bookingId!: string;

  @ApiProperty()
  sortOrder!: number;

  @ApiPropertyOptional()
  priceCents?: number | null;

  @ApiProperty()
  fullName!: string;

  @ApiPropertyOptional()
  age?: number | null;

  @ApiPropertyOptional({ enum: ['M', 'F', 'other'] })
  sex?: BookingManifestSex | null;

  /** May be null on legacy rows created before nationality became required. */
  @ApiPropertyOptional()
  nationality?: string | null;

  /** May be null on legacy rows created before idNumber became required. */
  @ApiPropertyOptional()
  idNumber?: string | null;

  /** May be null on legacy rows created before emergency contact became required. */
  @ApiPropertyOptional()
  emergencyContactName?: string | null;

  @ApiPropertyOptional()
  emergencyContactPhone?: string | null;

  @ApiPropertyOptional()
  emergencyContactEmail?: string | null;

  @ApiPropertyOptional()
  emergencyContactCountry?: string | null;

  @ApiPropertyOptional()
  emergencyContactAddress?: string | null;

  /** Legacy free-text medical notes — read-only; prefer structured fields below. */
  @ApiPropertyOptional()
  conditions?: string | null;

  @ApiPropertyOptional()
  allergies?: string | null;

  @ApiPropertyOptional()
  seriousMedicalConditions?: string | null;

  @ApiPropertyOptional()
  currentMedications?: string | null;

  @ApiPropertyOptional()
  dietaryNotes?: string | null;

  @ApiPropertyOptional()
  comment?: string | null;

  @ApiPropertyOptional()
  other?: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiPropertyOptional()
  updatedAt?: string | null;
}

export class CreateBookingManifestEntryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  priceCents?: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Le nom complet est obligatoire.' })
  @MaxLength(200)
  fullName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(150)
  age?: number;

  @ApiPropertyOptional({ enum: ['M', 'F', 'other'] })
  @IsOptional()
  @IsIn(['M', 'F', 'other'])
  sex?: BookingManifestSex;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'La nationalité est obligatoire.' })
  @MaxLength(100)
  nationality!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: "Le numéro de pièce d'identité est obligatoire." })
  @MaxLength(64)
  idNumber!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: "Le nom du contact d'urgence est obligatoire." })
  @MaxLength(200)
  emergencyContactName!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: "Le téléphone du contact d'urgence est obligatoire." })
  @MaxLength(40)
  emergencyContactPhone!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail({}, { message: "L'e-mail du contact d'urgence est invalide." })
  @MaxLength(255)
  emergencyContactEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  emergencyContactCountry?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  emergencyContactAddress?: string;

  /**
   * @deprecated Legacy free-text — ignored for persistence; use structured medical fields.
   * Accepted so older clients are not rejected by forbidNonWhitelisted.
   */
  @ApiPropertyOptional({ deprecated: true })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  conditions?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  allergies?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  seriousMedicalConditions?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  currentMedications?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  dietaryNotes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  comment?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  other?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(999)
  sortOrder?: number;
}

/** Partial update — pricing flows may patch price without resending nationality/idNumber. */
export class UpdateBookingManifestEntryDto extends PartialType(
  CreateBookingManifestEntryDto,
) {}
