import { PartialType } from '@nestjs/swagger';
import { CreateAboutResourceDto } from './create-about-resource.dto';

export class UpdateAboutResourceDto extends PartialType(CreateAboutResourceDto) {}
