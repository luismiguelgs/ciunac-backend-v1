import { PartialType } from '@nestjs/swagger';
import { CreateDocumentosDocenteDto } from './create-documentos_docente.dto';

export class UpdateDocumentosDocenteDto extends PartialType(CreateDocumentosDocenteDto) {}
