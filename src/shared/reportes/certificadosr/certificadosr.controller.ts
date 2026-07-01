import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from 'src/modules/authentication/auth/guards/api-key.guard';
import { CertificadosReporteAgrupado } from './interfaces/certificado-reporte.interface';
import { CertificadosrService } from './certificadosr.service';

@UseGuards(ApiKeyGuard)
@Controller('certificadosr')
export class CertificadosrController {
  constructor(private readonly certificadosrService: CertificadosrService) {}

  @Get()
  findAll(): Promise<CertificadosReporteAgrupado> {
    return this.certificadosrService.findAll();
  }
}
