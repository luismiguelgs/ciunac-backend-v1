import { PartialType } from '@nestjs/swagger';
import { CreateFacultadeDto } from './create-facultade.dto';

export class UpdateFacultadeDto extends PartialType(CreateFacultadeDto) {}
