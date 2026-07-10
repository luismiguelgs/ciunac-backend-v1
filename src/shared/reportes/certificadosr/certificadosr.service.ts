import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from 'mongoose';
import {
  Certificado,
  CertificadoDocument,
  TipoCertificado,
} from 'src/modules/administrativas/certificados/schemas/certificado.schema';
import { Solicitud } from 'src/modules/administrativas/solicitudes/entities/solicitud.entity';
import { In, Repository } from 'typeorm';
import {
  CertificadoReporte,
  CertificadosReporteAgrupado,
  GrupoNivelReporte,
} from './interfaces/certificado-reporte.interface';

interface DatosSolicitudReporte {
  periodo: string;
  numeroVoucher: string;
}

@Injectable()
export class CertificadosrService {
  constructor(
    @InjectModel(Certificado.name)
    private readonly certificadoModel: Model<CertificadoDocument>,
    @InjectRepository(Solicitud)
    private readonly solicitudRepository: Repository<Solicitud>,
  ) {}

  async findAll(): Promise<CertificadosReporteAgrupado> {
    const certificados = await this.certificadoModel
      .find({ impreso: false })
      .select({
        numeroRegistro: 1,
        tipo: 1,
        estudiante: 1,
        idioma: 1,
        nivel: 1,
        solicitudId: 1,
        fechaEmision: 1,
      })
      .sort({ fechaEmision: -1 })
      .lean()
      .exec();

    const solicitudIds = [
      ...new Set(
        certificados
          .map((certificado) => Number(certificado.solicitudId))
          .filter((id) => Number.isInteger(id) && id > 0),
      ),
    ];

    const solicitudesPorId = await this.obtenerDatosSolicitudes(solicitudIds);
    const reporte = this.crearReporteVacio();

    for (const certificado of certificados) {
      const grupoNivel = this.obtenerGrupoNivel(certificado.nivel);
      const grupoFormato = this.obtenerGrupoFormato(certificado.tipo);

      if (!grupoNivel || !grupoFormato) {
        continue;
      }

      const solicitudId = Number(certificado.solicitudId);
      const solicitud = solicitudesPorId.get(solicitudId);
      const item: CertificadoReporte = {
        numeroRegistro: certificado.numeroRegistro,
        tipo: certificado.tipo,
        alumno: certificado.estudiante,
        idioma: certificado.idioma,
        nivel: certificado.nivel,
        periodo: solicitud?.periodo ?? null,
        numeroVoucher: solicitud?.numeroVoucher ?? null,
      };

      reporte[grupoNivel][grupoFormato].push(item);
    }

    return reporte;
  }

  private async obtenerDatosSolicitudes(
    solicitudIds: number[],
  ): Promise<Map<number, DatosSolicitudReporte>> {
    if (solicitudIds.length === 0) {
      return new Map();
    }

    const solicitudes = await this.solicitudRepository.find({
      select: { id: true, periodo: true, numeroVoucher: true },
      where: { id: In(solicitudIds) },
    });

    return new Map(
      solicitudes.map((solicitud) => [
        solicitud.id,
        {
          periodo: solicitud.periodo,
          numeroVoucher: solicitud.numeroVoucher,
        },
      ]),
    );
  }

  private obtenerGrupoNivel(nivel: string): GrupoNivelReporte | null {
    const nivelNormalizado = nivel
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toUpperCase();

    if (nivelNormalizado === 'BASICO') {
      return 'basico';
    }

    if (nivelNormalizado === 'INTERMEDIO' || nivelNormalizado === 'AVANZADO') {
      return 'intermedioAvanzado';
    }

    return null;
  }

  private obtenerGrupoFormato(
    tipo: TipoCertificado,
  ): 'digitales' | 'fisicos' | null {
    if (tipo === TipoCertificado.VIRTUAL) {
      return 'digitales';
    }

    if (tipo === TipoCertificado.FISICO) {
      return 'fisicos';
    }

    return null;
  }

  private crearReporteVacio(): CertificadosReporteAgrupado {
    return {
      basico: {
        digitales: [],
        fisicos: [],
      },
      intermedioAvanzado: {
        digitales: [],
        fisicos: [],
      },
    };
  }
}
