import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { PagosBancoService } from './pagos-banco.service';
import { CreatePagosBancoDto } from './dto/create-pagos-banco.dto';
import { UpdatePagosBancoDto } from './dto/update-pagos-banco.dto';
import { ApiKeyGuard } from 'src/modules/authentication/auth/guards/api-key.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@UseGuards(ApiKeyGuard)
@Controller('pagos-banco')
export class PagosBancoController {
  constructor(private readonly pagosBancoService: PagosBancoService) { }

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

    return this.pagosBancoService.uploadAndProcess(file.buffer);
  }

  @Post('reverify')
  async reverify() {
    const { reverifiedCount } = await this.pagosBancoService.reverifyUnverified();
    return {
      message: `Se han reverificado ${reverifiedCount} pagos que estaban pendientes.`,
    };
  }

  @Post()
  create(@Body() createPagosBancoDto: CreatePagosBancoDto) {
    return this.pagosBancoService.create(createPagosBancoDto);
  }

  @Get()
  findAll() {
    return this.pagosBancoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pagosBancoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePagosBancoDto: UpdatePagosBancoDto) {
    return this.pagosBancoService.update(+id, updatePagosBancoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pagosBancoService.remove(+id);
  }
}
