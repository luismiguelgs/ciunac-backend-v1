import { Injectable, BadRequestException } from '@nestjs/common';
import { EstudiantesService } from 'src/modules/principales/estudiantes/estudiantes.service';
import { DocentesService } from 'src/modules/principales/docentes/docentes.service';
import { GruposService } from 'src/modules/estructura/grupos/grupos.service';
import { CreateGrupoDto } from 'src/modules/estructura/grupos/dto/create-grupo.dto';
import { Q10EstudianteDto } from './dto/q10-estudiante.dto';
import { getCurretDate_YYYYMMDD } from './lib/q10.helpers';
import { Q10_API_URL, SEDE_JORNADA } from './lib/q10.constants';
import { CiclosService } from 'src/modules/estructura/ciclos/ciclos.service';

type Periodo = {
    Consegutivo: number,
    Nombre: string,
    Fecha_inicio: string,
    Fecha_fin: string,
    Ordenamiento: number,
    Estado: boolean
}

@Injectable()
export class Q10Service {

    private readonly API_KEY = process.env.API_KEY_Q10 || '';

    constructor(
        private readonly estudiantesService: EstudiantesService,
        private readonly docentesService: DocentesService,
        private readonly gruposService: GruposService,
        private readonly ciclosService: CiclosService,
    ) { }

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
            const res = await fetch(`${Q10_API_URL}/cursos?Limit=150&Estado=Abierto`, {
                method: 'GET',
                headers: this.headers
            });
            const data = await res.json();
            const cursos = data.filter((curso: any) => curso.Nombre_periodo === periodo);
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
                const docente = await this.docentesService.findByIdentificacion(item.Numero_identificacion_docente);

                if (!docente) {
                    console.warn(`Docente con identificación ${item.Numero_identificacion_docente} no encontrado para el curso ${item.Codigo_curso}`);
                    continue;
                }

                // 2️⃣ Buscar ciclo por código
                // Se asume que item.Consecutivo_nivel o similar se mapea al código del ciclo en nuestra BD
                // Por ahora usamos item.Nombre_periodo o similar si aplica, o un campo de Q10 que represente el ciclo
                const ciclo = await this.ciclosService.findByCode(item.Codigo_asignatura?.toString());

                // 3️⃣ Mapear a CreateGrupoDto
                const grupoDto: CreateGrupoDto = {
                    codigo: item.Codigo,
                    moduloId: periodo,
                    docenteId: docente.id,
                    cicloId: ciclo ? ciclo.id : 1, // Si no lo encuentra, usa 1 por ahora
                    aulaId: 1,
                    frecuencia: item.Codigo.split("-")[2],
                    modalidad: item.Codigo.split("-")[1].slice(-1),
                };

                // 4️⃣ Guardar en la tabla grupos
                const nuevoGrupo = await this.gruposService.create(grupoDto);
                resultados.push(nuevoGrupo as never);
            }

            return {
                message: `${resultados.length} horarios de cursos guardados exitosamente como grupos.`,
                data: resultados
            };

        } catch (error) {
            console.error('Error al guardar horarios - cursos en BD:', error);
            throw new BadRequestException('Error al guardar horarios - cursos en BD');
        }
    }

    // 1️⃣ Crear estudiante en Q10
    async crearEstudianteEnQ10(body: Q10EstudianteDto) {
        try {
            const periodo = await this.getPeriodoActivo();
            const payload = {
                ...body,
                Direccion: 'Lima',
                Lugar_nacimiento: '15001',
                Lugar_residencia: '15001',
                Consecutivo_sedejornada: SEDE_JORNADA,
                Consecutivo_periodo: periodo,
            };

            const res = await fetch(`${Q10_API_URL}/estudiantes`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            // 🚨 Si Q10 devuelve un error (400, 409, etc.)
            if (!res.ok) {
                // Extrae mensaje limpio (puede variar según la estructura de Q10)
                const q10Message =
                    data?.Message || data?.message || data?.error || 'Error desconocido en Q10';

                throw new BadRequestException({
                    statusCode: 400,
                    message: `Error al registrar estudiante en Q10: ${q10Message}`,
                    q10Response: data, // puedes mantenerlo si quieres el detalle completo
                });
            }

            // 2️⃣ Si fue exitoso, registrar en tu BD local
            await this.crearEstudianteLocal(data);

            const register = await this.registrarEnPrograma(data.Codigo_estudiante, data.Numero_identificacion);
            if (!register) {
                throw new BadRequestException({
                    message: 'Error al registrar en el programa en Q10',
                    q10Response: register,
                });
            }

            return {
                message: 'Estudiante registrado en Q10 y sincronizado localmente',
                data,
                register,
            };
        } catch (error) {
            console.error('Error Q10 →', error);
            // Si el error viene de Q10, lo reenviamos con su mensaje real
            if (error instanceof BadRequestException) throw error;

            // Si es otro error (por ejemplo, de red o interno)
            throw new BadRequestException({
                statusCode: 400,
                message: error?.message || 'Error al registrar en Q10',
                q10Response: error?.response || error,
            });
        }
    }

    async registrarEnPrograma(code: string, dni: string) {
        const payload = {
            Codigo_estudiante: code,
            Consecutivo_inscripcion: await this.getRegister(code),
            Codigo_matricula: dni,
            Fecha_matricula: getCurretDate_YYYYMMDD(),
            Consecutivo_periodo: await this.getPeriodoActivo(),
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
    private async crearEstudianteLocal(data: any) {
        switch (data.Codigo_tipo_identificacion) {
            case 'PE01':
                data.Codigo_tipo_identificacion = 'DNI';
                break;
            case 'PE02':
                data.Codigo_tipo_identificacion = 'CE';
                break;
            default:
                data.Codigo_tipo_identificacion = 'PASAPORTE';
                break;
        }
        const dto = {
            nombres: [data.Primer_nombre, data.Segundo_nombre].filter(Boolean).join(' '),
            apellidos: [data.Primer_apellido, data.Segundo_apellido].filter(Boolean).join(' '),
            genero: data.Genero,
            fechaNacimiento: new Date(data.Fecha_nacimiento),
            tipoDocumento: data.Codigo_tipo_identificacion,
            numeroDocumento: data.Numero_identificacion,
            celular: data.Celular || data.Telefono
        };

        await this.estudiantesService.create(dto as any);
    }

    // 4️⃣ Obtener último periodo activo desde Q10
    private async getPeriodoActivo(): Promise<number> {
        try {
            const res = await fetch(`${Q10_API_URL}/periodos?Limit=30`, {
                method: 'GET',
                headers: this.headers
            });
            const data = await res.json();
            const sorted = data.sort((a: Periodo, b: Periodo) => b.Ordenamiento - a.Ordenamiento);
            return sorted[0].Consecutivo;
        } catch (err) {
            console.log('Error al obtener periodo', err);
            return 0;
        }
    }

    private async getRegister(code: string): Promise<number> {
        const res = await fetch(`${Q10_API_URL}/inscripciones?Codigo_estudiante=${code}`, {
            method: 'GET',
            headers: this.headers,
        });
        const data = await res.json();
        return data[0]?.Consecutivo_inscripcion ?? 0;
    }
}
