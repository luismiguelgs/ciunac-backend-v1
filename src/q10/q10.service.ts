import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { EstudiantesService } from 'src/modules/principales/estudiantes/estudiantes.service';
import { Estudiante } from 'src/modules/principales/estudiantes/entities/estudiante.entity';
import { DocentesService } from 'src/modules/principales/docentes/docentes.service';
import { GruposService } from 'src/modules/estructura/grupos/grupos.service';
import { CreateGrupoDto } from 'src/modules/estructura/grupos/dto/create-grupo.dto';
import { Q10EstudianteDto } from './dto/q10-estudiante.dto';
import { getCurretDate_YYYYMMDD } from './lib/q10.helpers';
import { Q10_API_URL, SEDE_JORNADA } from './lib/q10.constants';
import { CiclosService } from 'src/modules/estructura/ciclos/ciclos.service';
import { Q10EstudianteResponse } from './interfaces/q10-estudiante-response.interface';
import { Q10EstudianteRegistrationResponseDto } from './dto/q10-estudiante-response.dto';

type Periodo = {
  Consecutivo: number;
  Nombre: string;
  Fecha_inicio: string;
  Fecha_fin: string;
  Ordenamiento: number;
  Estado: boolean;
};

@Injectable()
export class Q10Service {
  private readonly API_KEY = process.env.API_KEY_Q10 || '';

  constructor(
    private readonly estudiantesService: EstudiantesService,
    private readonly docentesService: DocentesService,
    private readonly gruposService: GruposService,
    private readonly ciclosService: CiclosService,
  ) {}

  private get headers() {
    return {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'Api-Key': this.API_KEY ?? '',
    };
  }

  // Listar horarios - cursos en Q10
  async listarHorariosCursos(periodo: string) {
    try {
      const res = await fetch(
        `${Q10_API_URL}/cursos?Limit=150&Estado=Abierto`,
        {
          method: 'GET',
          headers: this.headers,
        },
      );
      const data = await res.json();
      const cursos = data.filter(
        (curso: any) => curso.Nombre_periodo === periodo,
      );
      return cursos;
    } catch (error) {
      console.error('Error al listar horarios - cursos en Q10:', error);
      throw new BadRequestException('Error al listar horarios - cursos en Q10');
    }
  }

  // Guardar horarios en bd -
  async guardarHorariosCursos(periodo: number, nombrePeriodo: string) {
    try {
      const cursos = await this.listarHorariosCursos(nombrePeriodo);
      const resultados = [];

      for (const item of cursos) {
        // 1️⃣ Buscar docente por identificación
        const docente = await this.docentesService.findByIdentificacion(
          item.Numero_identificacion_docente,
        );

        if (!docente) {
          console.warn(
            `Docente con identificación ${item.Numero_identificacion_docente} no encontrado para el curso ${item.Codigo_curso}`,
          );
          continue;
        }

        // 2️⃣ Buscar ciclo por código
        // Se asume que item.Consecutivo_nivel o similar se mapea al código del ciclo en nuestra BD
        // Por ahora usamos item.Nombre_periodo o similar si aplica, o un campo de Q10 que represente el ciclo
        const ciclo = await this.ciclosService.findByCode(
          item.Codigo_asignatura?.toString(),
        );

        // 3️⃣ Mapear a CreateGrupoDto
        const grupoDto: CreateGrupoDto = {
          codigo: item.Codigo,
          moduloId: periodo,
          docenteId: docente.id,
          cicloId: ciclo ? ciclo.id : 1, // Si no lo encuentra, usa 1 por ahora
          aulaId: 1,
          frecuencia: item.Codigo.split('-')[2],
          modalidad: item.Codigo.split('-')[1].slice(-1),
        };

        // 4️⃣ Guardar en la tabla grupos
        const nuevoGrupo = await this.gruposService.create(grupoDto);
        resultados.push(nuevoGrupo as never);
      }

      return {
        message: `${resultados.length} horarios de cursos guardados exitosamente como grupos.`,
        data: resultados,
      };
    } catch (error) {
      console.error('Error al guardar horarios - cursos en BD:', error);
      throw new BadRequestException('Error al guardar horarios - cursos en BD');
    }
  }

  // 1️⃣ Crear estudiante en Q10
  async crearEstudianteEnQ10(
    body: Q10EstudianteDto,
  ): Promise<Q10EstudianteRegistrationResponseDto> {
    const { facultadId, escuelaId, tipoEstudiante, imgDoc, ...datosQ10 } = body;
    await this.estudiantesService.validarFacultadYEscuela({
      facultadId,
      escuelaId,
      tipoEstudiante,
      numeroDocumento: body.Numero_identificacion,
    });
    const periodo = await this.getPeriodoActivo();
    const payload = {
      ...datosQ10,
      Direccion: 'Lima',
      Lugar_nacimiento: '12158',
      Lugar_residencia: '12158',
      Consecutivo_sedejornada: SEDE_JORNADA,
      Consecutivo_periodo: periodo,
    };

    let res: Response;
    try {
      res = await fetch(`${Q10_API_URL}/estudiantes`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(payload),
      });
    } catch {
      throw new BadGatewayException({
        code: 'Q10_UNAVAILABLE',
        message: 'No fue posible comunicarse con Q10',
        retryAllowed: true,
      });
    }

    const responseData = await this.readJson(res);
    if (!res.ok) {
      throw new BadRequestException({
        code: 'Q10_STUDENT_CREATION_REJECTED',
        message: `Error al registrar estudiante en Q10: ${this.getQ10Message(responseData)}`,
      });
    }

    const q10Student = this.validateCreatedStudentResponse(responseData);
    let estudiante: Estudiante;

    try {
      estudiante = await this.crearEstudianteLocal(q10Student, body);
    } catch (error: unknown) {
      if (error instanceof ConflictException) {
        throw error;
      }

      throw new BadGatewayException({
        code: 'Q10_CREATED_LOCAL_SYNC_FAILED',
        message: 'Q10 creo al estudiante, pero fallo la sincronizacion local',
        retryAllowed: false,
        idQ10: q10Student.Codigo_estudiante,
      });
    }

    try {
      const register = await this.registrarEnPrograma(
        q10Student.Codigo_estudiante,
        estudiante.numeroDocumento,
        periodo,
      );
      if (!register) {
        throw new Error('Q10 no confirmo la matricula del programa');
      }
    } catch {
      throw new BadGatewayException({
        code: 'Q10_CREATED_PROGRAM_PENDING',
        message: 'El estudiante fue creado, pero su matricula quedo pendiente',
        retryAllowed: false,
        estudianteId: estudiante.id,
        idQ10: q10Student.Codigo_estudiante,
      });
    }

    return {
      status: 'COMPLETED',
      estudiante: {
        id: estudiante.id,
        idQ10: q10Student.Codigo_estudiante,
        numeroDocumento: estudiante.numeroDocumento,
      },
      programaRegistrado: true,
    };
  }

  async registrarEnPrograma(
    code: string,
    dni: string,
    periodo?: number,
  ): Promise<unknown | null> {
    const periodoMatricula =
      periodo === undefined ? await this.getPeriodoActivo() : periodo;
    const payload = {
      Codigo_estudiante: code,
      Consecutivo_inscripcion: await this.getRegister(code),
      Codigo_matricula: dni,
      Fecha_matricula: getCurretDate_YYYYMMDD(),
      Consecutivo_periodo: periodoMatricula,
      Consecutivo_sede_jornada: SEDE_JORNADA,
      Codigo_nivel: '01',
      Consecutivo_grupo: '',
      Formalizada: true,
      Codigo_condicion_matricula: 'N',
      Observaciones: '',
    };

    const res = await fetch(`${Q10_API_URL}/matriculasProgramas`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return res.ok ? data : null;
  }

  // 3️⃣ Función que registra localmente usando el servicio de estudiantes
  private async crearEstudianteLocal(
    data: Q10EstudianteResponse,
    originalBody: Q10EstudianteDto,
  ): Promise<Estudiante> {
    let tipoDocumento: string;
    switch (
      data.Codigo_tipo_identificacion ??
      originalBody.Codigo_tipo_identificacion
    ) {
      case 'PE01':
        tipoDocumento = 'DNI';
        break;
      case 'PE02':
        tipoDocumento = 'CE';
        break;
      default:
        tipoDocumento = 'PASAPORTE';
        break;
    }

    return this.estudiantesService.syncFromQ10({
      idQ10: data.Codigo_estudiante,
      nombres: [
        data.Primer_nombre ?? originalBody.Primer_nombre,
        data.Segundo_nombre ?? originalBody.Segundo_nombre,
      ]
        .filter(Boolean)
        .join(' '),
      apellidos: [
        data.Primer_apellido ?? originalBody.Primer_apellido,
        data.Segundo_apellido ?? originalBody.Segundo_apellido,
      ]
        .filter(Boolean)
        .join(' '),
      genero: data.Genero ?? originalBody.Genero,
      fechaNacimiento: new Date(
        data.Fecha_nacimiento ?? originalBody.Fecha_nacimiento,
      ),
      tipoDocumento,
      numeroDocumento:
        data.Numero_identificacion ?? originalBody.Numero_identificacion,
      celular:
        data.Celular ??
        data.Telefono ??
        originalBody.Celular ??
        originalBody.Telefono,
      direccion: originalBody.Direccion,
      email: data.Correo_electronico ?? data.Email ?? originalBody.Email,
      facultadId: originalBody.facultadId,
      escuelaId: originalBody.escuelaId,
      tipoEstudiante: originalBody.tipoEstudiante,
      imgDoc: originalBody.imgDoc,
    });
  }

  private validateCreatedStudentResponse(data: unknown): Q10EstudianteResponse {
    if (!data || typeof data !== 'object') {
      throw this.invalidCreatedStudentResponse();
    }

    const response = data as Record<string, unknown>;
    if (
      typeof response.Codigo_estudiante !== 'string' ||
      response.Codigo_estudiante.trim().length === 0
    ) {
      throw this.invalidCreatedStudentResponse();
    }

    return response as unknown as Q10EstudianteResponse;
  }

  private invalidCreatedStudentResponse(): BadGatewayException {
    return new BadGatewayException({
      code: 'Q10_CREATED_INVALID_RESPONSE',
      message: 'Q10 no devolvio Codigo_estudiante en una respuesta exitosa',
      retryAllowed: false,
    });
  }

  private async readJson(response: Response): Promise<unknown> {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  private getQ10Message(data: unknown): string {
    if (!data || typeof data !== 'object') {
      return 'Error desconocido en Q10';
    }

    const response = data as Record<string, unknown>;
    const message = response.Message ?? response.message ?? response.error;
    return typeof message === 'string' ? message : 'Error desconocido en Q10';
  }

  // 4️⃣ Obtener último periodo activo desde Q10
  private async getPeriodoActivo(): Promise<number> {
    try {
      const res = await fetch(`${Q10_API_URL}/periodos?Limit=30`, {
        method: 'GET',
        headers: this.headers,
      });
      const data = await res.json();
      const sorted = data.sort(
        (a: Periodo, b: Periodo) => b.Ordenamiento - a.Ordenamiento,
      );
      return sorted[0].Consecutivo;
    } catch (err) {
      console.log('Error al obtener periodo', err);
      return 0;
    }
  }

  private async getRegister(code: string): Promise<number> {
    const res = await fetch(
      `${Q10_API_URL}/inscripciones?Codigo_estudiante=${code}`,
      {
        method: 'GET',
        headers: this.headers,
      },
    );
    const data = await res.json();
    return data[0]?.Consecutivo_inscripcion ?? 0;
  }
}
