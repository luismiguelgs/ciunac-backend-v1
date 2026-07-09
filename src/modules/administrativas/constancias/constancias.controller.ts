import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ConstanciasService, ProcesarFirmaResult } from './constancias.service';
import { CreateConstanciaDto } from './dto/create-constancia.dto';
import { UpdateConstanciaDto } from './dto/update-constancia.dto';
//import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiKeyGuard } from 'src/modules/authentication/auth/guards/api-key.guard';
import { Constancia } from './schemas/constancia.schema';
import { ProcesarFirmaDto } from './dto/procesar-firma.dto';

//@UseGuards(JwtAuthGuard)
@UseGuards(ApiKeyGuard)
@Controller('constancias')
export class ConstanciasController {
  constructor(private readonly constanciasService: ConstanciasService) {}

  @Post()
  create(@Body() createConstanciaDto: CreateConstanciaDto) {
    return this.constanciasService.create(createConstanciaDto);
  }

  @Get()
  findAll() {
    return this.constanciasService.findAll();
  }

  @Get('pendientes')
  findPendientes(): Promise<Constancia[]> {
    return this.constanciasService.findPendientes();
  }

  @Get('impresos')
  findByImpreso(): Promise<Constancia[]> {
    return this.constanciasService.findByImpreso();
  }

  @Get('aceptados')
  findByAceptado(): Promise<Constancia[]> {
    return this.constanciasService.findByAceptado();
  }

  @Get('solicitud/:solicitudId')
  findBySolicitudId(
    @Param('solicitudId', ParseIntPipe) solicitudId: number,
  ): Promise<Constancia | null> {
    return this.constanciasService.findBySolicitudId(solicitudId);
  }

  @Patch('procesar-firma')
  procesarFirma(@Body() body: ProcesarFirmaDto): Promise<ProcesarFirmaResult> {
    return this.constanciasService.procesarFirma(
      body.constanciaId,
      body.fileId,
      body.solicitudId,
      body.signedFileId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.constanciasService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateConstanciaDto: UpdateConstanciaDto,
  ) {
    return this.constanciasService.update(id, updateConstanciaDto);
  }

  /* las constancias no se borran
	@UseGuards(JwtAuthGuard)
	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.constanciasService.remove(id);
	}
	*/
}
