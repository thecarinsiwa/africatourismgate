import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import type { Bookings } from '../../../../entities/generated';

export class BookingEmergencyContactDto {
  @ApiPropertyOptional({ nullable: true })
  name!: string | null;

  @ApiPropertyOptional({ nullable: true })
  phone!: string | null;

  @ApiPropertyOptional({ nullable: true })
  email!: string | null;

  @ApiPropertyOptional({ nullable: true })
  country!: string | null;

  @ApiPropertyOptional({ nullable: true })
  address!: string | null;
}

export class UpdateBookingEmergencyContactDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: "Le nom du contact d'urgence est obligatoire." })
  @MaxLength(200)
  name!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: "Le téléphone du contact d'urgence est obligatoire." })
  @MaxLength(40)
  phone!: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsEmail({}, { message: "L'e-mail du contact d'urgence est invalide." })
  @MaxLength(255)
  email?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string | null;
}

export function toBookingEmergencyContactDto(
  booking: Pick<
    Bookings,
    | 'emergencyContactName'
    | 'emergencyContactPhone'
    | 'emergencyContactEmail'
    | 'emergencyContactCountry'
    | 'emergencyContactAddress'
  >,
): BookingEmergencyContactDto | null {
  const name = booking.emergencyContactName?.trim() || null;
  const phone = booking.emergencyContactPhone?.trim() || null;
  const email = booking.emergencyContactEmail?.trim() || null;
  const country = booking.emergencyContactCountry?.trim() || null;
  const address = booking.emergencyContactAddress?.trim() || null;
  if (!name && !phone && !email && !country && !address) {
    return null;
  }
  return { name, phone, email, country, address };
}
