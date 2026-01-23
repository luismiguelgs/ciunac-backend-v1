import {
	BadRequestException,
	Controller,
	Param,
	Post,
	Body,
	UploadedFile,
	UseInterceptors,
	UseGuards
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiKeyGuard } from 'src/modules/usuarios/auth/guards/api-key.guard';

@UseGuards(ApiKeyGuard)
@Controller('upload')
export class UploadController {
	constructor(private readonly uploadService: UploadService) { }

	@Post(':folder')
	@UseInterceptors(FileInterceptor('file'))
	async uploadFile(
		@UploadedFile() file: Express.Multer.File,
		@Param('folder') folder: string,
		@Body('nombre') nombre: string,
	) {

		if (!file) throw new Error('No se ha enviado ningún archivo')
		if (!folder || !['DNIS', 'VOUCHERS', 'BECAS'].includes(folder.toUpperCase()))
			throw new BadRequestException('Debes especificar una carpeta válida: DNIS, BECAS o VOUCHERS');

		const result = await this.uploadService.uploadToDrive(
			file,
			folder.toUpperCase(),
			nombre,
		);
		return {
			success: true,
			...result,
		};
	}
}
