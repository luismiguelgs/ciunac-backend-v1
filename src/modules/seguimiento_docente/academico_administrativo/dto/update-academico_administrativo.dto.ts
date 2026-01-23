import { PartialType } from '@nestjs/mapped-types';
import { CreateAcademicoAdministrativoDto } from './create-academico_administrativo.dto';

export class UpdateAcademicoAdministrativoDto extends PartialType(CreateAcademicoAdministrativoDto) { }
