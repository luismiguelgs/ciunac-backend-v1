import { PartialType } from '@nestjs/mapped-types';
import { CreateConstanciaDto } from './create-constancia.dto';

export class UpdateConstanciaDto extends PartialType(CreateConstanciaDto) {}
