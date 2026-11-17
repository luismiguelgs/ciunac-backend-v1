import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Estudiante } from './entities/estudiante.entity';
import { Repository } from 'typeorm';
import { SyncEstudianteQ10Input } from './interfaces/sync-estudiante-q10.interface';
import { Facultad } from 'src/modules/auxiliares/facultades/entities/facultad.entity';
import { Escuela } from 'src/modules/auxiliares/escuelas/entities/escuela.entity';

@Injectable()
export class EstudiantesService {
  constructor(
    @InjectRepository(Estudiante)
    private readonly estudianteRepository: Repository<Estudiante>,
    @InjectRepository(Facultad)
    private readonly facultadRepository: Repository<Facultad>,
    @InjectRepository(Escuela)
    private readonly escuelaRepository: Repository<Escuela>,
  ) {}

  async create(createEstudianteDto: CreateEstudianteDto): Promise<Estudiante> {
    const { tipoEstudiante, imgDoc, ...datos } = createEstudianteDto;
    if (tipoEstudiante != null) {
      await this.validarFacultadYEscuela(createEstudianteDto);
    }
    const item = this.estudianteRepository.create({
      ...datos,
      ...(tipoEstudiante != null ? { tipoEstudiante } : {}),
      ...(imgDoc != null ? { imgDoc } : {}),
    });
    return await this.estudianteRepository.save(item);
  }

  async findAll(): Promise<Estudiante[]> {
    return await this.estudianteRepository.find({
      relations: ['facultad', 'escuela', 'usuario'],
    });
  }

  async findOne(id: string): Promise<Estudiante | null> {
    return await this.estudianteRepository.findOne({
      where: { id },
      relations: ['facultad', 'escuela'],
    });
  }

  async update(
    id: string,
    updateEstudianteDto: UpdateEstudianteDto,
  ): Promise<Estudiante | null> {
    const existe = await this.estudianteRepository.findOne({
      where: { id },
    });
    if (!existe) {
      return null;
    }
    const { tipoEstudiante, imgDoc, ...datos } = updateEstudianteDto;
    if (
      tipoEstudiante != null ||
      (updateEstudianteDto.escuelaId != null && existe.tipoEstudiante != null)
    ) {
      await this.validarFacultadYEscuela({
        facultadId: updateEstudianteDto.facultadId ?? existe.facultadId,
        escuelaId: updateEstudianteDto.escuelaId ?? existe.escuelaId,
        tipoEstudiante: tipoEstudiante ?? existe.tipoEstudiante,
      });
    }
    await this.estudianteRepository.update(id, {
      ...datos,
      ...(tipoEstudiante != null ? { tipoEstudiante } : {}),
      ...(imgDoc != null ? { imgDoc } : {}),
    });
    return this.findOne(id);
  }

  async remove(id: string): Promise<void | { message: string }> {
    const estudiante = await this.findOne(id);
    if (!estudiante) {
      throw new Error('Estudiante no encontrado');
    }
    await this.estudianteRepository.remove(estudiante);
    return { message: 'Estudiante eliminado' };
  }

  async findByDni(dni: string): Promise<Estudiante | null> {
    return await this.estudianteRepository.findOne({
      where: { numeroDocumento: dni },
      relations: ['facultad', 'escuela', 'usuario'],
    });
  }

  async validarFacultadYEscuela(
    input: Pick<
      SyncEstudianteQ10Input,
      'facultadId' | 'escuelaId' | 'tipoEstudiante'
    > & {
      numeroDocumento?: string;
    },
  ): Promise<void> {
    const existente = input.numeroDocumento
      ? await this.estudianteRepository.findOne({
          where: { numeroDocumento: input.numeroDocumento },
        })
      : null;
    const facultadId = input.facultadId ?? existente?.facultadId;
    const escuelaId = input.escuelaId ?? existente?.escuelaId;
    const tipoEstudiante = input.tipoEstudiante ?? existente?.tipoEstudiante;

    if (facultadId != null) {
      const facultad = await this.facultadRepository.findOne({
        where: { id: facultadId },
      });
      if (!facultad) {
        throw new BadRequestException('La facultad indicada no existe');
      }
    }

    if (escuelaId != null) {
      const escuela = await this.escuelaRepository.findOne({
        where: { id: escuelaId },
      });
      if (!escuela) {
        throw new BadRequestException('La escuela indicada no existe');
      }
      if (facultadId != null && escuela.facultadId !== facultadId) {
        throw new BadRequestException(
          'La escuela indicada no pertenece a la facultad indicada',
        );
      }
      if (tipoEstudiante === 'PRE' || tipoEstudiante === 'POS') {
        if (escuela.tipo == null) {
          throw new BadRequestException(
            'La escuela indicada debe clasificarse como PRE o POS antes de registrar al estudiante',
          );
        }
        if (escuela.tipo !== tipoEstudiante) {
          throw new BadRequestException(
            'El tipo de la escuela indicada no coincide con el tipo del estudiante',
          );
        }
      }
    }
  }

  async syncFromQ10(input: SyncEstudianteQ10Input): Promise<Estudiante> {
    const [estudiantePorDocumento, estudiantePorIdQ10] = await Promise.all([
      this.estudianteRepository.findOne({
        where: { numeroDocumento: input.numeroDocumento },
      }),
      this.estudianteRepository.findOne({ where: { idQ10: input.idQ10 } }),
    ]);

    if (
      estudiantePorIdQ10 &&
      estudiantePorIdQ10.numeroDocumento !== input.numeroDocumento
    ) {
      throw new ConflictException({
        code: 'Q10_ID_ALREADY_LINKED',
        message: 'El identificador Q10 ya pertenece a otro estudiante',
      });
    }

    if (
      estudiantePorDocumento?.idQ10 &&
      estudiantePorDocumento.idQ10 !== input.idQ10
    ) {
      throw new ConflictException({
        code: 'Q10_ID_CONFLICT',
        message: 'El estudiante ya tiene otro identificador Q10',
      });
    }

    const {
      facultadId,
      escuelaId,
      tipoEstudiante,
      imgDoc,
      ...datosPersonales
    } = input;
    const datosSincronizados = {
      ...datosPersonales,
      ...(facultadId != null ? { facultadId } : {}),
      ...(escuelaId != null ? { escuelaId } : {}),
      ...(tipoEstudiante != null ? { tipoEstudiante } : {}),
      ...(imgDoc != null ? { imgDoc } : {}),
    };
    const estudiante = estudiantePorDocumento
      ? Object.assign(estudiantePorDocumento, datosSincronizados)
      : this.estudianteRepository.create(datosSincronizados);

    try {
      return await this.estudianteRepository.save(estudiante);
    } catch (error: unknown) {
      if (this.isUniqueConstraintViolation(error)) {
        throw new ConflictException({
          code: 'Q10_ID_ALREADY_LINKED',
          message: 'El identificador Q10 ya pertenece a otro estudiante',
        });
      }
      throw error;
    }
  }

  private isUniqueConstraintViolation(error: unknown): boolean {
    if (!error || typeof error !== 'object') {
      return false;
    }

    const databaseError = error as {
      code?: string;
      driverError?: { code?: string };
    };
    return (
      databaseError.code === '23505' ||
      databaseError.driverError?.code === '23505'
    );
  }
}
