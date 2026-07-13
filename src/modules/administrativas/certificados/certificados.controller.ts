import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiKeyGuard } from 'src/modules/authentication/auth/guards/api-key.guard';
import {
  CertificadosService,
  ProcesarFirmaCertificadoResult,
  SubirArchivoCertificadoResult,
} from './certificados.service';
import { CreateCertificadoDto } from './dto/create-certificado.dto';
import { ProcesarFirmaCertificadoDto } from './dto/procesar-firma-certificado.dto';
import { UpdateCertificadoDto } from './dto/update-certificado.dto';
import { UploadCertificadoDto } from './dto/upload-certificado.dto';
import { Certificado } from './schemas/certificado.schema';

@UseGuards(ApiKeyGuard)
@Controller('certificados')
export class CertificadosController {
  constructor(private readonly certificadosService: CertificadosService) {}

  @Post()
  create(
    @Body() createCertificadoDto: CreateCertificadoDto,
  ): Promise<Certificado> {
    return this.certificadosService.create(createCertificadoDto);
  }

  @Post(':id/archivo')
  @UseInterceptors(FileInterceptor('file'))
  subirArchivo(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() body: UploadCertificadoDto,
  ): Promise<SubirArchivoCertificadoResult> {
    return this.certificadosService.subirArchivo(id, file, body.fileId);
  }

  @Get()
  findAll(): Promise<Certificado[]> {
    return this.certificadosService.findAll();
  }

  @Get('pendientes')
  findPendientes(): Promise<Certificado[]> {
    return this.certificadosService.findPendientes();
  }

  @Get('firmados')
  findFirmados(): Promise<Certificado[]> {
    return this.certificadosService.findFirmados();
  }

  @Get('aceptados')
  findAceptados(): Promise<Certificado[]> {
    return this.certificadosService.findAceptados();
  }

  @Get('solicitud/:solicitudId')
  findBySolicitudId(
    @Param('solicitudId', ParseIntPipe) solicitudId: number,
  ): Promise<Certificado | null> {
    return this.certificadosService.findBySolicitudId(solicitudId);
  }

  @Get('impresos')
  findByImpreso(@Query('impreso') impreso: string): Promise<Certificado[]> {
    return this.certificadosService.findByImpreso(impreso === 'true');
  }

  @Patch('procesar-firma')
  procesarFirma(
    @Body() body: ProcesarFirmaCertificadoDto,
  ): Promise<ProcesarFirmaCertificadoResult> {
    return this.certificadosService.procesarFirma(
      body.certificadoId,
      body.fileId,
      body.solicitudId,
      body.signedFileId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Certificado | null> {
    return this.certificadosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCertificadoDto: UpdateCertificadoDto,
  ): Promise<Certificado | null> {
    return this.certificadosService.update(id, updateCertificadoDto);
  }
}
