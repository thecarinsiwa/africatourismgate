import { PartialType } from '@nestjs/swagger';
import { CreateLegalPageDto } from './create-legal-page.dto';

export class UpdateLegalPageDto extends PartialType(CreateLegalPageDto) {}
