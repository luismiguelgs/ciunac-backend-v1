import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CiclosService } from 'src/modules/estructura/ciclos/ciclos.service';
import { GruposService } from 'src/modules/estructura/grupos/grupos.service';
import { DocentesService } from 'src/modules/principales/docentes/docentes.service';
import { EstudiantesService } from 'src/modules/principales/estudiantes/estudiantes.service';
import { Q10Service } from './q10.service';

describe('Q10Service', () => {
  let service: Q10Service;
  let fetchMock: jest.SpiedFunction<typeof fetch>;
  let consoleError: jest.SpiedFunction<typeof console.error>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Q10Service,
        { provide: EstudiantesService, useValue: { create: jest.fn() } },
        {
          provide: DocentesService,
          useValue: { findByIdentificacion: jest.fn() },
        },
        { provide: GruposService, useValue: { create: jest.fn() } },
        {
          provide: CiclosService,
          useValue: { findByCode: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<Q10Service>(Q10Service);
    fetchMock = jest.spyOn(global, 'fetch');
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    fetchMock.mockRestore();
    consoleError.mockRestore();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return only courses from the requested period', async () => {
    fetchMock.mockResolvedValue({
      json: jest.fn().mockResolvedValue([
        { Codigo: 'A', Nombre_periodo: '2026-I' },
        { Codigo: 'B', Nombre_periodo: '2025-II' },
      ]),
    } as unknown as Response);

    await expect(service.listarHorariosCursos('2026-I')).resolves.toEqual([
      { Codigo: 'A', Nombre_periodo: '2026-I' },
    ]);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/cursos?Limit=150&Estado=Abierto'),
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('should translate network errors into BadRequestException', async () => {
    fetchMock.mockRejectedValue(new Error('network unavailable'));

    await expect(service.listarHorariosCursos('2026-I')).rejects.toThrow(
      BadRequestException,
    );
  });
});
