export class ActaExamenUbicacionResponseDto {
  id: string;
  _id: string;
  schemaVersion?: number;
  examenId?: number;
  codigo?: string;
  fecha?: Date;
  creado_en?: Date;
  modificado_en?: Date;

  [key: string]: unknown;
}
