import { PartialType } from '@nestjs/swagger';
import { CreateAcademicoAdministrativoDto } from './create-academico_administrativo.dto';

export class UpdateAcademicoAdministrativoDto extends PartialType(CreateAcademicoAdministrativoDto) { }
