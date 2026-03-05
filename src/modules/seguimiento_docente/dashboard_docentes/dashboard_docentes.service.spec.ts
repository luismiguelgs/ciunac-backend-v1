import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DashboardDocentesService } from './dashboard_docentes.service';
import { PerfilDocenteResultado } from '../perfil_docente_resultados/entities/perfil_docente_resultado.entity';
import { CumplimientoDocente } from '../cumplimiento_docente/entities/cumplimiento_docente.entity';
import { EncuestaRespuesta } from '../encuesta_respuestas/entities/encuesta_respuesta.entity';
import { EncuestaRespuestasDetalle } from '../encuesta_respuestas_detalle/entities/encuesta_respuestas_detalle.entity';
import { Docente } from '../../principales/docentes/entities/docente.entity';
import { DocumentosDocente } from '../documentos_docente/entities/documentos_docente.entity';
import { PerfilDocente } from '../perfil_docente/entities/perfil_docente.entity';
import { ModulosService } from '../../estructura/modulos/modulos.service';

describe('DashboardDocentesService', () => {
  let service: DashboardDocentesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardDocentesService,
        {
          provide: getRepositoryToken(PerfilDocenteResultado),
          useValue: {},
        },
        {
          provide: getRepositoryToken(EncuestaRespuesta),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Docente),
          useValue: {},
        },
        {
          provide: getRepositoryToken(DocumentosDocente),
          useValue: {},
        },
        {
          provide: getRepositoryToken(CumplimientoDocente),
          useValue: {},
        },
        {
          provide: getRepositoryToken(EncuestaRespuestasDetalle),
          useValue: {},
        },
        {
          provide: getRepositoryToken(PerfilDocente),
          useValue: {},
        },
        {
          provide: ModulosService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<DashboardDocentesService>(DashboardDocentesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
