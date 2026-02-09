import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CumplimientoDocenteService } from './cumplimiento_docente.service';
import { CumplimientoDocenteController } from './cumplimiento_docente.controller';
import { CumplimientoDocente } from './entities/cumplimiento_docente.entity';
import { PerfilDocenteResultadosModule } from '../perfil_docente_resultados/perfil_docente_resultados.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CumplimientoDocente]),
    PerfilDocenteResultadosModule,
  ],
  controllers: [CumplimientoDocenteController],
  providers: [CumplimientoDocenteService],
  exports: [CumplimientoDocenteService],
})
export class CumplimientoDocenteModule { }
