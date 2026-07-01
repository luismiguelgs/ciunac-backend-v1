import { TipoCertificado } from 'src/modules/administrativas/certificados/schemas/certificado.schema';

export interface CertificadoReporte {
  numeroRegistro: string;
  tipo: TipoCertificado;
  alumno: string;
  idioma: string;
  nivel: string;
  numeroVoucher: string | null;
}

export interface CertificadosPorFormato {
  digitales: CertificadoReporte[];
  fisicos: CertificadoReporte[];
}

export type GrupoNivelReporte = 'basico' | 'intermedioAvanzado';

export type CertificadosReporteAgrupado = Record<
  GrupoNivelReporte,
  CertificadosPorFormato
>;
