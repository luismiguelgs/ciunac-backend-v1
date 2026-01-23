import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicoAdministrativoService } from './academico_administrativo.service';
import { AcademicoAdministrativoController } from './academico_administrativo.controller';
import { AcademicoAdministrativo } from './entities/academico_administrativo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AcademicoAdministrativo])],
  controllers: [AcademicoAdministrativoController],
  providers: [AcademicoAdministrativoService],
})
export class AcademicoAdministrativoModule { }
