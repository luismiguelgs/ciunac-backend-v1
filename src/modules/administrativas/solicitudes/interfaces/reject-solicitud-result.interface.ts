import { Solicitud } from '../entities/solicitud.entity';

export type RejectNotificationStatus = 'ENVIADA' | 'NO_ENVIADA' | 'NO_APLICA';

export type RejectNotificationReason =
  | 'ESTUDIANTE_SIN_EMAIL'
  | 'ERROR_ENVIO'
  | 'YA_RECHAZADA';

export interface RejectSolicitudResult {
  solicitud: Solicitud;
  notificacion: {
    estado: RejectNotificationStatus;
    motivo?: RejectNotificationReason;
  };
}
