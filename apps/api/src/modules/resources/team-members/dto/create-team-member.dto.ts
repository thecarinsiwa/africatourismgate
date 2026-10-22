import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import {
  SLUG_PATTERN,
  SLUG_VALIDATION_MESSAGE,
} from '../../../../common/constants/slug';

const hasValue = (value: unknown) => value !== undefined && value !== null && value !== '';

export class CreateTeamMemberDto {
  @ApiProperty({ example: 'Marie Kabila' })
  @IsNotEmpty({ message: 'Le nom est obligatoire.' })
  @IsString()
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({
    example: 'marie-kabila',
    description: 'Unique per locale; generated from the name when omitted or empty.',
  })
  @ValidateIf((o: CreateTeamMemberDto) => hasValue(o.slug))
  @IsString()
  @MaxLength(180)
  @Matches(SLUG_PATTERN, { message: SLUG_VALIDATION_MESSAGE })
  slug?: string | null;

  @ApiProperty({ example: 'Directrice générale' })
  @IsNotEmpty({ message: 'Le rôle est obligatoire.' })
  @IsString()
  @MaxLength(160)
  role!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bio?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(512)
  @IsUrl(
    { require_tld: false, protocols: ['http', 'https'] },
    { message: "L'URL de la photo doit être valide." },
  )
  photoUrl?: string | null;

  @ApiPropertyOptional({ example: 'marie.kabila@africatourismgate.com' })
  @ValidateIf((o: CreateTeamMemberDto) => hasValue(o.email))
  @IsString()
  @MaxLength(255)
  @IsEmail({}, { message: "L'adresse e-mail doit être valide." })
  email?: string | null;

  @ApiPropertyOptional({ example: 'https://www.linkedin.com/in/marie-kabila' })
  @ValidateIf((o: CreateTeamMemberDto) => hasValue(o.linkedinUrl))
  @IsString()
  @MaxLength(512)
  @IsUrl({ protocols: ['http', 'https'] }, { message: "L'URL LinkedIn doit être valide." })
  linkedinUrl?: string | null;

  @ApiPropertyOptional({ example: 'https://x.com/marie_kabila' })
  @ValidateIf((o: CreateTeamMemberDto) => hasValue(o.xUrl))
  @IsString()
  @MaxLength(512)
  @IsUrl({ protocols: ['http', 'https'] }, { message: "L'URL X doit être valide." })
  xUrl?: string | null;

  @ApiPropertyOptional()
  @ValidateIf((o: CreateTeamMemberDto) => hasValue(o.facebookUrl))
  @IsString()
  @MaxLength(512)
  @IsUrl({ protocols: ['http', 'https'] }, { message: "L'URL Facebook doit être valide." })
  facebookUrl?: string | null;

  @ApiPropertyOptional()
  @ValidateIf((o: CreateTeamMemberDto) => hasValue(o.instagramUrl))
  @IsString()
  @MaxLength(512)
  @IsUrl({ protocols: ['http', 'https'] }, { message: "L'URL Instagram doit être valide." })
  instagramUrl?: string | null;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ enum: ['draft', 'published'] })
  @IsOptional()
  @IsEnum(['draft', 'published'])
  status?: 'draft' | 'published';

  @ApiPropertyOptional({ example: 'fr' })
  @IsOptional()
  @IsString()
  @MaxLength(5)
  locale?: string;
}
