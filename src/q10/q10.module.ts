import { Module } from '@nestjs/common';
import { Q10Service } from './q10.service';
import { Q10Controller } from './q10.controller';
import { EstudiantesModule } from 'src/modules/principales/estudiantes/estudiantes.module';
import { DocentesModule } from 'src/modules/principales/docentes/docentes.module';
import { GruposModule } from 'src/modules/estructura/grupos/grupos.module';
import { CiclosModule } from 'src/modules/estructura/ciclos/ciclos.module';

@Module({
    imports: [EstudiantesModule, DocentesModule, GruposModule, CiclosModule],
    controllers: [Q10Controller],
    providers: [Q10Service],
})
export class Q10Module { }
