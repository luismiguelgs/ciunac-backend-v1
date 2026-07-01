import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ModulosService } from 'src/modules/estructura/modulos/modulos.service';
import { DocentesService } from 'src/modules/principales/docentes/docentes.service';
import { EncuestaRespuesta } from './entities/encuesta_respuesta.entity';
import { EncuestaRespuestasService } from './encuesta_respuestas.service';

describe('EncuestaRespuestasService', () => {
  let service: EncuestaRespuestasService;
  let repository: { find: jest.Mock };
  let modulosService: { findOne: jest.Mock; findByName: jest.Mock };
  let queryRunner: {
    connect: jest.Mock;
    startTransaction: jest.Mock;
    commitTransaction: jest.Mock;
    rollbackTransaction: jest.Mock;
    release: jest.Mock;
    query: jest.Mock;
    manager: { create: jest.Mock; save: jest.Mock };
  };

  beforeEach(async () => {
    repository = { find: jest.fn() };
    modulosService = {
      findOne: jest.fn(),
      findByName: jest.fn(),
    };
    queryRunner = {
      connect: jest.fn().mockResolvedValue(undefined),
      startTransaction: jest.fn().mockResolvedValue(undefined),
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      rollbackTransaction: jest.fn().mockResolvedValue(undefined),
      release: jest.fn().mockResolvedValue(undefined),
      query: jest.fn().mockResolvedValue(undefined),
      manager: {
        create: jest.fn(),
        save: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EncuestaRespuestasService,
        {
          provide: getRepositoryToken(EncuestaRespuesta),
          useValue: repository,
        },
        {
          provide: DocentesService,
          useValue: {
            findByIdentificacion: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: ModulosService,
          useValue: modulosService,
        },
        {
          provide: DataSource,
          useValue: { createQueryRunner: jest.fn(() => queryRunner) },
        },
      ],
    }).compile();

    service = module.get<EncuestaRespuestasService>(EncuestaRespuestasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return an empty list when the module does not exist', async () => {
    modulosService.findOne.mockResolvedValue(null);

    await expect(
      service.findByDocenteAndModulo('docente-1', 10),
    ).resolves.toEqual([]);
    expect(repository.find).not.toHaveBeenCalled();
  });

  it('should find responses using the module period', async () => {
    const responses = [{ id: 1, docenteId: 'docente-1' }];
    modulosService.findOne.mockResolvedValue({ id: 10, nombre: '2026-I' });
    repository.find.mockResolvedValue(responses);

    await expect(
      service.findByDocenteAndModulo('docente-1', 10),
    ).resolves.toEqual(responses);
    expect(repository.find).toHaveBeenCalledWith({
      where: { docenteId: 'docente-1', periodo: '2026-I' },
      relations: ['docente'],
      order: { fechaRegistro: 'DESC' },
    });
  });

  it('should commit and release the transaction for an empty CSV', async () => {
    await expect(service.uploadAndProcess(Buffer.from(''))).resolves.toEqual({
      success: true,
      message: 'Procesadas 0 encuestas correctamente.',
    });
    expect(queryRunner.connect).toHaveBeenCalledTimes(1);
    expect(queryRunner.startTransaction).toHaveBeenCalledTimes(1);
    expect(queryRunner.commitTransaction).toHaveBeenCalledTimes(1);
    expect(queryRunner.rollbackTransaction).not.toHaveBeenCalled();
    expect(queryRunner.release).toHaveBeenCalledTimes(1);
  });
});
