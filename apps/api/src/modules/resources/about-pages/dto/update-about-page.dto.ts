import { PartialType } from '@nestjs/swagger';
import { CreateAboutPageDto } from './create-about-page.dto';

export class UpdateAboutPageDto extends PartialType(CreateAboutPageDto) {}
