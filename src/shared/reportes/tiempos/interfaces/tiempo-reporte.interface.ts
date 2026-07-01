export type FormatoCertificado = 'DIGITAL' | 'FISICO';

export interface TiempoReporte {
  certificadoId: string;
  solicitudId: number;
  tipoSolicitud: string;
  periodo: string;
  formatoCertificado: FormatoCertificado;
  fechaSolicitud: Date;
  fechaEmision: Date;
  tiempoHoras: number;
}
