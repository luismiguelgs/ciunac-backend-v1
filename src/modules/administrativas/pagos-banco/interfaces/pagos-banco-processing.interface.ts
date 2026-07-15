export interface PagosBancoCsvRow {
  dni_codigo?: string;
  n_voucher?: string;
  alumno?: string;
  monto?: string;
  fecha_pago?: string;
  fecha_efectiva?: string;
  voucher_restante?: string;
  archivo?: string;
}

export interface CsvValidationError {
  fila: number;
  campo: string;
  mensaje: string;
}

export interface ReverifyPagosBancoSummary {
  pagosEvaluados: number;
  pagosVerificados: number;
  solicitudesPagadas: number;
  solicitudesObservadas: number;
  vouchersSinSolicitud: number;
  estadosSinCambio: number;
  estadosDesconocidos: number;
}

export interface ReverifyPagosBancoResult {
  message: string;
  resumen: ReverifyPagosBancoSummary;
}

export interface UploadPagosBancoSummary {
  registrosLeidos: number;
  pagosRegistrados: number;
  duplicadosOmitidos: number;
  vouchersSinSolicitud: number;
  solicitudesPagadas: number;
  solicitudesObservadas: number;
  vouchersVerificadosSinCambio: number;
  estadosDesconocidos: number;
  pagosPreviosReverificados: number;
}

export interface UploadPagosBancoResult {
  message: string;
  resumen: UploadPagosBancoSummary;
}
