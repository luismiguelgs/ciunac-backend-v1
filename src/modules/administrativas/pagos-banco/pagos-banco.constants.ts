export const PAGOS_CSV_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const PAGOS_CSV_MAX_ROWS = 50_000;
export const PAGOS_CSV_MAX_REPORTED_ERRORS = 100;

export const PAGOS_CSV_REQUIRED_HEADERS = [
  'n_voucher',
  'monto',
  'fecha_efectiva',
] as const;
