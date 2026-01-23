import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException } from '@nestjs/common';
import { SolicitudesService } from './solicitudes.service';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';
import { UpdateSolicitudDto } from './dto/update-solicitud.dto';
import { UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from 'src/modules/usuarios/auth/guards/api-key.guard';
import { Solicitud } from './entities/solicitud.entity';
//import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

//@UseGuards(JwtAuthGuard)
@UseGuards(ApiKeyGuard)
@Controller('solicitudes')
export class SolicitudesController {
	constructor(private readonly solicitudesService: SolicitudesService) { }

	@Post()
	create(@Body() createSolicitudDto: CreateSolicitudDto) {
		return this.solicitudesService.create(createSolicitudDto);
	}

	@Get()
	findAll() {
		return this.solicitudesService.findAll();
	}

	// 🟢 CERTIFICADOS
	// Ejemplo: GET /solicitudes/certificados?estado=1
	@Get('certificados')
	async getCertificadosPorEstado(@Query('estado') estado: string): Promise<Solicitud[]> {
		if (!estado || isNaN(Number(estado))) {
			throw new BadRequestException('El parámetro "estado" es obligatorio y debe ser un número válido');
		}
		const estadoId = Number(estado);
		return this.solicitudesService.findCertificadosPorEstado(+estadoId);
	}

	// 🟡 CONSTANCIAS
	// Ejemplo: GET /solicitudes/constancias?estado=2
	@Get('constancias')
	async getConstanciasPorEstado(
		@Query('estado') estado: string,
	): Promise<Solicitud[]> {
		const estadoId = parseInt(estado);
		return this.solicitudesService.findConstanciasPorEstado(estadoId);
	}

	// 🔵 EXÁMENES DE UBICACIÓN
	// Ejemplo: GET /solicitudes/examenes-ubicacion?estado=3
	@Get('examenes-ubicacion')
	async getExamenesUbicacionPorEstado(
		@Query('estado') estado: string,
	): Promise<Solicitud[]> {
		const estadoId = parseInt(estado);
		return this.solicitudesService.findExamenesPorEstado(estadoId);
	}

	// Buscar solicitudes por numero_documento del estudiante
	@Get('documento/:numeroDocumento')
	findByNumeroDocumento(@Param('numeroDocumento') numeroDocumento: string): Promise<Solicitud[]> {
		return this.solicitudesService.findByNumeroDocumento(numeroDocumento);
	}

	// GET /solicitudes/reporte-fechas?inicio=2024-01-01&fin=2024-01-31&tipo=7
	// GET /solicitudes/reporte-fechas?inicio=2024-01-01&fin=2024-01-31&tipo=n
	@Get('reporte-fechas')
	async getReportesPorFechas(
		@Query('inicio') inicio: string,
		@Query('fin') fin: string,
		@Query('tipo') tipo: '7' | 'n',
	): Promise<Solicitud[]> {
		if (!inicio || !fin || !tipo) {
			throw new BadRequestException('Faltan parámetros: inicio, fin o tipo');
		}

		// Validamos que 'tipo' sea estrictamente "7" o "n"
		if (tipo !== '7' && tipo !== 'n') {
			throw new BadRequestException('El parámetro "tipo" solo acepta "7" (Exámenes) o "n" (El resto)');
		}

		// Llamamos al servicio casteando el tipo para que coincida con la firma
		return this.solicitudesService.findByFechaYModo(inicio, fin, tipo as '7' | 'n');
	}

	//ORDEN DE RUTAS, primero las que no necesitan id, luego las que si necesitan id
	//GET /solicitudes/:id
	//PATCH /solicitudes/:id
	//DELETE /solicitudes/:id

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.solicitudesService.findOne(+id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateSolicitudDto: UpdateSolicitudDto) {
		return this.solicitudesService.update(+id, updateSolicitudDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.solicitudesService.remove(+id);
	}
}
