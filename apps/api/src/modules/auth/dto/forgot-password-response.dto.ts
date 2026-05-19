import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordResponseDto {
  @ApiProperty({
    example:
      'Si un compte existe pour cette adresse, un lien de réinitialisation a été envoyé.',
  })
  message!: string;
}
