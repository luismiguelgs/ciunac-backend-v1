import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Estudiante } from './entities/estudiante.entity';
import { Brackets, Repository } from 'typeorm';
import { ListarEstudiantesDto } from './dto/listar-estudiantes.dto';
import { EstudiantesPaginadosDto } from './dto/estudiantes-paginados.dto';
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

  async findAll({
    page = 1,
    limit = 25,
    search,
    tipoEstudiante,
    facultadId,
    escuelaId,
    vinculadoQ10,
  }: ListarEstudiantesDto = {}): Promise<EstudiantesPaginadosDto> {
    const query = this.estudianteRepository.createQueryBuilder('estudiante');

    if (search) {
      const patron = `%${search.replace(/[!%_]/g, '!$&')}%`;
      query.andWhere(
        new Brackets((terms) => {
          terms
            .where("estudiante.numeroDocumento ILIKE :patron ESCAPE '!'")
            .orWhere("estudiante.codigo ILIKE :patron ESCAPE '!'")
            .orWhere(
              "concat_ws(' ', estudiante.nombres, estudiante.apellidos) ILIKE :patron ESCAPE '!'",
            )
            .orWhere("estudiante.email ILIKE :patron ESCAPE '!'");
        }),
        { patron },
      );
    }

    if (tipoEstudiante === 'SIN_CLASIFICAR') {
      query.andWhere('estudiante.tipoEstudiante IS NULL');
    } else if (tipoEstudiante !== undefined) {
      query.andWhere('estudiante.tipoEstudiante = :tipoEstudiante', {
        tipoEstudiante,
      });
    }
    if (facultadId !== undefined) {
      query.andWhere('estudiante.facultadId = :facultadId', { facultadId });
    }
    if (escuelaId !== undefined) {
      query.andWhere('estudiante.escuelaId = :escuelaId', { escuelaId });
    }
    if (vinculadoQ10 !== undefined) {
      query.andWhere(
        vinculadoQ10 === 'true'
          ? "NULLIF(BTRIM(estudiante.idQ10), '') IS NOT NULL"
          : "NULLIF(BTRIM(estudiante.idQ10), '') IS NULL",
      );
    }

    const total = await query.getCount();
    const meta = { page, limit, total, totalPages: Math.ceil(total / limit) };
    if (page > meta.totalPages) return { data: [], meta };

    const estudiantes = await query
      .leftJoin('estudiante.facultad', 'facultad')
      .leftJoin('estudiante.escuela', 'escuela')
      .select([
        'estudiante.id',
        'estudiante.nombres',
        'estudiante.apellidos',
        'estudiante.tipoDocumento',
        'estudiante.numeroDocumento',
        'estudiante.codigo',
        'estudiante.tipoEstudiante',
        'estudiante.idQ10',
        'estudiante.facultadId',
        'estudiante.escuelaId',
        'facultad.id',
        'facultad.nombre',
        'escuela.id',
        'escuela.nombre',
      ])
      .orderBy('estudiante.apellidos', 'ASC')
      .addOrderBy('estudiante.nombres', 'ASC')
      .addOrderBy('estudiante.id', 'ASC')
      .offset((page - 1) * limit)
      .limit(limit)
      .getMany();

    const data = estudiantes.map((estudiante) => ({
      id: estudiante.id,
      nombres: estudiante.nombres,
      apellidos: estudiante.apellidos,
      tipoDocumento: estudiante.tipoDocumento,
      numeroDocumento: estudiante.numeroDocumento,
      codigo: estudiante.codigo ?? null,
      tipoEstudiante: estudiante.tipoEstudiante ?? null,
      idQ10: estudiante.idQ10?.trim() || null,
      facultadId: estudiante.facultadId ?? null,
      escuelaId: estudiante.escuelaId ?? null,
      facultad: estudiante.facultad
        ? { id: estudiante.facultad.id, nombre: estudiante.facultad.nombre }
        : null,
      escuela: estudiante.escuela
        ? { id: estudiante.escuela.id, nombre: estudiante.escuela.nombre }
        : null,
    }));

    return { data, meta };
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
        throw this.academicError(
          'La facultad indicada no existe',
          'facultadId',
          'FACULTY_NOT_FOUND',
        );
      }
    }

    if (escuelaId != null) {
      const escuela = await this.escuelaRepository.findOne({
        where: { id: escuelaId },
      });
      if (!escuela) {
        throw this.academicError(
          'La escuela indicada no existe',
          'escuelaId',
          'SCHOOL_NOT_FOUND',
        );
      }
      if (facultadId != null && escuela.facultadId !== facultadId) {
        throw this.academicError(
          'La escuela indicada no pertenece a la facultad indicada',
          'escuelaId',
          'SCHOOL_FACULTY_MISMATCH',
        );
      }
      if (tipoEstudiante === 'PRE' || tipoEstudiante === 'POS') {
        if (escuela.tipo == null) {
          throw this.academicError(
            'La escuela indicada debe clasificarse como PRE o POS antes de registrar al estudiante',
            'escuelaId',
            'SCHOOL_UNCLASSIFIED',
          );
        }
        if (escuela.tipo !== tipoEstudiante) {
          throw this.academicError(
            'El tipo de la escuela indicada no coincide con el tipo del estudiante',
            'escuelaId',
            'SCHOOL_TYPE_MISMATCH',
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
      codigo,
      imgDoc,
      ...datosPersonales
    } = input;
    const datosSincronizados = {
      ...datosPersonales,
      ...(facultadId != null ? { facultadId } : {}),
      ...(escuelaId != null ? { escuelaId } : {}),
      ...(tipoEstudiante != null ? { tipoEstudiante } : {}),
      ...(codigo != null ? { codigo } : {}),
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

  private academicError(
    message: string,
    field: string,
    rule: string,
  ): BadRequestException {
    return new BadRequestException({
      code: 'Q10_LOCAL_VALIDATION_FAILED',
      message,
      validationErrors: [{ field, rules: [rule] }],
    });
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
