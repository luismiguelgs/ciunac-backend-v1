import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, UseGuards, Get, Query } from '@nestjs/common';
import { EncuestaRespuestasService } from './encuesta_respuestas.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiKeyGuard } from 'src/modules/usuarios/auth/guards/api-key.guard';

@UseGuards(ApiKeyGuard)
@Controller('encuesta-respuestas')
export class EncuestaRespuestasController {
	constructor(private readonly encuestaRespuestasService: EncuestaRespuestasService) { }

	@Post('upload')
	@UseInterceptors(FileInterceptor('file'))
	async uploadFile(@UploadedFile() file: Express.Multer.File) {
		if (!file) {
			throw new BadRequestException('No se ha subido ningún archivo');
		}

		// Validar tipo de archivo si es necesario (CSV)
		if (file.mimetype !== 'text/csv' && !file.originalname.match(/\.(csv)$/)) {
			throw new BadRequestException('Solo se permiten archivos CSV');
		}

		return this.encuestaRespuestasService.uploadAndProcess(file.buffer);
	}

	@Get('buscar')
	async findByDocenteAndModulo(
		@Query('docenteId') docenteId: string,
		@Query('moduloId') moduloId: string
	) {
		return this.encuestaRespuestasService.findByDocenteAndModulo(docenteId, Number(moduloId));
	}
}
