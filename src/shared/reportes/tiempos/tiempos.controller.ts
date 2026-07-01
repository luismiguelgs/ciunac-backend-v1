import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from 'src/modules/authentication/auth/guards/api-key.guard';
import { TiempoReporte } from './interfaces/tiempo-reporte.interface';
import { TiemposService } from './tiempos.service';

@UseGuards(ApiKeyGuard)
@Controller('tiempos')
export class TiemposController {
  constructor(private readonly tiemposService: TiemposService) {}

  @Get()
  findAll(): Promise<TiempoReporte[]> {
    return this.tiemposService.findAll();
  }
}
