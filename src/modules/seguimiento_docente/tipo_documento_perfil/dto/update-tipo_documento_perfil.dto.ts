import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoDocumentoPerfilDto } from './create-tipo_documento_perfil.dto';

export class UpdateTipoDocumentoPerfilDto extends PartialType(CreateTipoDocumentoPerfilDto) {}
