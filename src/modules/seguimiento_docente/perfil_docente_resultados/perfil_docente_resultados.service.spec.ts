import { Test, TestingModule } from '@nestjs/testing';
import { PerfilDocenteResultadosService } from './perfil_docente_resultados.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PerfilDocenteResultado } from './entities/perfil_docente_resultado.entity';
import { EncuestaMetricasDocente } from '../encuesta_metricas_docente/entities/encuesta_metricas_docente.entity';
import { CumplimientoDocente } from '../cumplimiento_docente/entities/cumplimiento_docente.entity';
import { PerfilDocente } from '../perfil_docente/entities/perfil_docente.entity';
import { EncuestaRespuesta } from '../encuesta_respuestas/entities/encuesta_respuesta.entity';
import { ModulosService } from 'src/modules/estructura/modulos/modulos.service';

describe('PerfilDocenteResultadosService', () => {
  let service: PerfilDocenteResultadosService;

  const mockPerfilDocenteResultadoRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    merge: jest.fn(),
    remove: jest.fn(),
  };

  const mockEncuestaMetricasDocenteRepository = {
    findOne: jest.fn(),
  };

  const mockCumplimientoDocenteRepository = {
    find: jest.fn(),
  };

  const mockPerfilDocenteRepository = {
    findOne: jest.fn(),
  };

  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
  };

  const mockEncuestaRespuestaRepository = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  const mockModulosService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PerfilDocenteResultadosService,
        {
          provide: getRepositoryToken(PerfilDocenteResultado),
          useValue: mockPerfilDocenteResultadoRepository,
        },
        {
          provide: getRepositoryToken(EncuestaMetricasDocente),
          useValue: mockEncuestaMetricasDocenteRepository,
        },
        {
          provide: getRepositoryToken(CumplimientoDocente),
          useValue: mockCumplimientoDocenteRepository,
        },
        {
          provide: getRepositoryToken(PerfilDocente),
          useValue: mockPerfilDocenteRepository,
        },
        {
          provide: getRepositoryToken(EncuestaRespuesta),
          useValue: mockEncuestaRespuestaRepository,
        },
        {
          provide: ModulosService,
          useValue: mockModulosService,
        },
      ],
    })
      .compile();

    service = module.get<PerfilDocenteResultadosService>(
      PerfilDocenteResultadosService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should include cumplimiento and rubro identifiers in evaluation detail', async () => {
    mockModulosService.findOne.mockResolvedValue({ id: 16, nombre: '2026-06' });
    mockQueryBuilder.getRawMany.mockResolvedValue([
      { grupo: 'INGLÉS BÁSICO 5 G1-REGULAR', promedio: '87.05' },
    ]);
    mockCumplimientoDocenteRepository.find.mockResolvedValue([
      {
        id: 125,
        academicoAdministrativoId: 1,
        puntaje: 100,
        academicoAdministrativo: {
          id: 1,
          nombre: 'Presentación oportuna de Actas de notas',
          peso: 0.1,
        },
      },
    ]);
    mockEncuestaMetricasDocenteRepository.findOne.mockResolvedValue({
      id: 178,
      promedioGeneral: '86.07',
    });

    const result = await service.getDetalleEvaluacion(
      16,
      '80d3c38d-d2ea-4c42-8e11-20e66a24bf07',
    );

    expect(result.cumplimiento).toEqual([
      {
        cumplimientoId: 125,
        rubroId: 1,
        rubro: 'Presentación oportuna de Actas de notas',
        puntaje: 100,
        peso: 0.1,
        puntajePonderado: '10.00',
      },
    ]);
  });
});
