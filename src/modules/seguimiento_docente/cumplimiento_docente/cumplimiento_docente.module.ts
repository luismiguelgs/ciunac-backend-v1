import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CumplimientoDocenteService } from './cumplimiento_docente.service';
import { CumplimientoDocenteController } from './cumplimiento_docente.controller';
import { CumplimientoDocente } from './entities/cumplimiento_docente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CumplimientoDocente])],
  controllers: [CumplimientoDocenteController],
  providers: [CumplimientoDocenteService],
  exports: [CumplimientoDocenteService],
})
export class CumplimientoDocenteModule { }
