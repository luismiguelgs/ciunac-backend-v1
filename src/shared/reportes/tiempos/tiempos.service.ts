import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from 'mongoose';
import { Solicitud } from 'src/modules/administrativas/solicitudes/entities/solicitud.entity';
import {
  Certificado,
  CertificadoDocument,
} from 'src/modules/administrativas/certificados/schemas/certificado.schema';
import { In, Repository } from 'typeorm';
import { TiempoReporte } from './interfaces/tiempo-reporte.interface';

@Injectable()
export class TiemposService {
  constructor(
    @InjectModel(Certificado.name)
    private readonly certificadoModel: Model<CertificadoDocument>,
    @InjectRepository(Solicitud)
    private readonly solicitudRepository: Repository<Solicitud>,
  ) {}

  async findAll(): Promise<TiempoReporte[]> {
    const certificados = await this.certificadoModel
      .find()
      .select({ _id: 1, solicitudId: 1, fechaEmision: 1 })
      .lean()
      .exec();

    const solicitudIds = [
      ...new Set(
        certificados
          .map((certificado) => Number(certificado.solicitudId))
          .filter((id) => Number.isInteger(id) && id > 0),
      ),
    ];

    if (solicitudIds.length === 0) {
      return [];
    }

    const solicitudes = await this.solicitudRepository.find({
      where: { id: In(solicitudIds) },
      relations: { tiposSolicitud: true },
    });
    const solicitudesPorId = new Map(
      solicitudes.map((solicitud) => [solicitud.id, solicitud]),
    );

    return certificados
      .map((certificado): TiempoReporte | null => {
        const solicitudId = Number(certificado.solicitudId);
        const solicitud = solicitudesPorId.get(solicitudId);

        if (!solicitud) {
          return null;
        }

        const fechaEmision = new Date(certificado.fechaEmision);
        const fechaSolicitud = new Date(solicitud.creadoEn);

        if (
          Number.isNaN(fechaEmision.getTime()) ||
          Number.isNaN(fechaSolicitud.getTime())
        ) {
          return null;
        }

        return {
          certificadoId: String(certificado._id),
          solicitudId,
          tipoSolicitud: solicitud.tiposSolicitud.solicitud,
          periodo: solicitud.periodo,
          formatoCertificado: solicitud.digital ? 'DIGITAL' : 'FISICO',
          fechaSolicitud,
          fechaEmision,
          tiempoHoras: this.calcularHoras(fechaSolicitud, fechaEmision),
        };
      })
      .filter((reporte): reporte is TiempoReporte => reporte !== null)
      .sort((a, b) => b.fechaEmision.getTime() - a.fechaEmision.getTime());
  }

  private calcularHoras(fechaInicio: Date, fechaFin: Date): number {
    const milisegundosPorHora = 1000 * 60 * 60;
    const horas =
      (fechaFin.getTime() - fechaInicio.getTime()) / milisegundosPorHora;

    return Math.round(horas * 100) / 100;
  }
}
