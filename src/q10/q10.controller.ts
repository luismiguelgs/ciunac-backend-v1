import { Body, Controller, Post, UseGuards, Get, Query } from '@nestjs/common';
import { Q10Service } from './q10.service';
import { Q10EstudianteDto } from './dto/q10-estudiante.dto';
import { Q10HorariosDto } from './dto/q10-horarios.dto';
import { ApiKeyGuard } from 'src/modules/authentication/auth/guards/api-key.guard';
import {
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  Q10EstudianteRegistrationResponseDto,
  Q10PartialFailureResponseDto,
  Q10RegistrationErrorResponseDto,
} from './dto/q10-estudiante-response.dto';

@ApiTags('Q10')
@ApiHeader({ name: 'x-api-key', required: true })
@UseGuards(ApiKeyGuard)
@Controller('q10')
export class Q10Controller {
  constructor(private readonly q10Service: Q10Service) {}

  @Post('estudiantes')
  @ApiOperation({
    summary: 'Crear estudiante en Q10 y sincronizarlo localmente',
    description:
      'tipoEstudiante, imgDoc, facultadId y escuelaId son opcionales y se guardan solo en estudiantes (PostgreSQL), nunca se envian a Q10. PRE/POS requieren una escuela del mismo tipo si se selecciona; PG admite relaciones academicas. Los valores omitidos o null conservan los datos locales existentes.',
  })
  @ApiResponse({ status: 201, type: Q10EstudianteRegistrationResponseDto })
  @ApiBody({
    type: Q10EstudianteDto,
    examples: {
      conDatosAcademicosLocales: {
        summary: 'Registro con facultad y escuela locales',
        value: {
          Primer_nombre: 'Ana',
          Segundo_nombre: 'Maria',
          Primer_apellido: 'Perez',
          Segundo_apellido: 'Lopez',
          Email: 'ana@example.com',
          Codigo_tipo_identificacion: 'PE01',
          Numero_identificacion: '12345678',
          Genero: 'F',
          Fecha_nacimiento: '2000-01-01',
          Telefono: '014444444',
          Celular: '999999999',
          Direccion: 'Lima',
          Codigo_programa: 'INGLES',
          facultadId: 3,
          escuelaId: 8,
          tipoEstudiante: 'PRE',
          imgDoc: 'https://drive.google.com/file/d/ID_DEVUELTO_POR_UPLOAD/view',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    type: Q10RegistrationErrorResponseDto,
    description:
      'Datos invalidos, tipoEstudiante o URL imgDoc invalidos, facultad o escuela inexistentes, escuela sin clasificar o incompatible con la facultad/tipo del estudiante, o registro rechazado por Q10.',
  })
  @ApiConflictResponse({
    type: Q10RegistrationErrorResponseDto,
    description: 'Documento o identificador Q10 incompatible',
  })
  @ApiResponse({
    status: 413,
    type: Q10RegistrationErrorResponseDto,
    description: 'JSON excede el limite permitido',
  })
  @ApiResponse({
    status: 500,
    type: Q10RegistrationErrorResponseDto,
    description: 'Error inesperado; consultar operationId en logs',
  })
  @ApiBadGatewayResponse({
    type: Q10PartialFailureResponseDto,
    description:
      'Q10_PERIOD_LOOKUP_FAILED: no se envio el alta por periodo invalido. Q10_UNAVAILABLE: resultado remoto incierto. Q10_CREATED_INVALID_RESPONSE, Q10_CREATED_LOCAL_SYNC_FAILED o Q10_CREATED_PROGRAM_PENDING: resultado parcial o incierto. Todos usan retryAllowed=false; no reenviar automaticamente el alta. X-Operation-Id permite localizar el error en logs.',
  })
  async register(
    @Body() body: Q10EstudianteDto,
  ): Promise<Q10EstudianteRegistrationResponseDto> {
    return this.q10Service.crearEstudianteEnQ10(body);
  }

  @Get('horarios-cursos')
  async listarHorariosCursos(@Query('periodo') periodo: string) {
    return this.q10Service.listarHorariosCursos(periodo);
  }

  @Post('horarios-cursos')
  async guardarHorariosCursos(@Body() body: Q10HorariosDto) {
    const { periodo, nombrePeriodo } = body;
    return this.q10Service.guardarHorariosCursos(periodo, nombrePeriodo);
  }
}
