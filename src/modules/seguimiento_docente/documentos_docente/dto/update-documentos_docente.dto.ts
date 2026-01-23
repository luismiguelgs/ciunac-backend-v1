import { PartialType } from '@nestjs/mapped-types';
import { CreateDocumentosDocenteDto } from './create-documentos_docente.dto';

export class UpdateDocumentosDocenteDto extends PartialType(CreateDocumentosDocenteDto) {}
